class Payment{
    constructor(db){
        this.db = db;

        //binding
        this.create = this.create.bind(this);
        this.updatePayment = this.updatePayment.bind(this);
        this.markAsFailed = this.markAsFailed.bind(this);
        this.markAsSuccess = this.markAsSuccess.bind(this);
    }


    async create(payload){
        try{
            const [payment] = await this.db("payments").insert(payload).returning("*");
            return payment;
        }catch(error){
            throw error;
        }
    }


    async updatePayment(paymentId,updateData){
        try{
            const [payment] = await this.db("payments")
                                .update({...updateData,updated_at:this.db.fn.now()})
                                .where({id:paymentId})
                                .returning("*");
            return payment;
        }catch(error){
            throw error;
        }
    }

    async markAsSuccess(paymentId,gatewayData){
        try{
            return await this.updatePayment(paymentId,{
                status:"success",
                gateway_payment_id:gatewayData.id,
                gateway_signature:gatewayData.razorpay_signature,
                paid_at:this.db.fn.now(),
                gateway_response:gatewayData,
                payment_method:gatewayData.method,
                gateway_order_id:gatewayData.order_id
            })
        }catch(error){
            throw error;
        }
    }

    async markAsFailed(paymentId,reason){
        try{
            return await this.updatePayment(paymentId,{
                status:"failed",
                failed_reason:reason
            })
        }catch(error){
            throw error;
        }
    }

    async findById(paymentId){
        try{
            return await this.db("payments").where({id:paymentId}).first();
        }catch(error){
            throw error;
        }
    }

    async findByGatewayPaymentId(gatewayPaymentId){
        try{
            return await this.db("payments")
                        .where({gateway_payment_id:gatewayPaymentId})
                        .first();st
        }catch(error){
            throw error;
        }
    }


}

export default Payment;