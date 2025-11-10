import sendEmail from "../utils/mail.mjs";
import env_constant from "../../env.config.mjs";

class SendMail {
    constructor(){
        this.templates = {};
        this.user = env_constant.gmail.user;
        this.store = [];        // queue
        this.failedStore = [];  // permanently failed emails
        this.maxRetry = 3;      // retry limit
        this.isFlushing = false;
    }

    addTemplate(key, template){
        this.templates[key] = template;
        return this;
    }

    async send(to, key, params = {}){
        if (!this.templates[key]) return;

        const { sub, body } = this.templates[key];

        const html = Object.entries(params).reduce((acc,[k,v])=>{
            const re = new RegExp(`{{${k}}}`, "g");
            return acc.replace(re, v);
        }, body);

        

        const option = {
            from: `Admin <${this.user}>`,
            to,
            subject: sub,
            html,
            retryCount: 0  // ✅ important
        };

        try {
            const info = await sendEmail(option);
            console.log(`✅ Sent: ${info.messageId}`);
        } catch (error) {
            console.error("❌ Send error:", error.code, error.responseCode);

            // ✅ detect hard bounce (permanent failure)
            if ([550, 552, 553, 554].includes(error.responseCode)) {
                console.log("🚫 HARD BOUNCE → not retrying:", option.to);
                this.failedStore.push(option);
                return;
            }

            // ✅ retry if limit not exceeded
            if (option.retryCount < this.maxRetry) {
                option.retryCount++;
                this.store.push(option);
                console.log(`🔁 Retrying (${option.retryCount}/${this.maxRetry}): ${option.subject}`);
            } else {
                console.log("☠️ Max retry reached → moving to failedStore");
                this.failedStore.push(option);
            }
        }
    }

    async flushQueue(){
        if (this.isFlushing) return;
        this.isFlushing = true;

        const pending = [...this.store];
        this.store = [];

        console.log(`📤 Flushing ${pending.length} queued emails...`);

        for (const option of pending) {
            try {
                const info = await sendEmail(option);
                console.log(`✅ Queue sent: ${info.messageId}`);
            } catch (error) {
                console.error(`❌ Queue error: ${error.responseCode}`);

                // ✅ hard bounce (don't retry)
                if ([550, 552, 553, 554].includes(error.responseCode)) {
                    console.log("🚫 HARD BOUNCE → not retrying:", option.to);
                    this.failedStore.push(option);
                    continue;
                }

                // ✅ retry limit check
                if (option.retryCount < this.maxRetry) {
                    option.retryCount++;
                    this.store.push(option);
                    console.log(`🔁 Retry again (${option.retryCount}/${this.maxRetry})`);
                } else {
                    console.log(`☠️ Max retries hit → FAILED: ${option.subject}`);
                    this.failedStore.push(option);
                }
            }
        }

        this.isFlushing = false;
    }
}

export default SendMail;
