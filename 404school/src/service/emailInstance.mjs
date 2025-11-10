import SendMail from "./emailService.mjs";
import templates from "../utils/templates.mjs";

const mailer = new SendMail();

const keys = [
    "verify-email",
    "2-step-verify",
    "welcome",
    "test"
]

keys.forEach(key=>mailer.addTemplate(key,templates[key]));

export default mailer;