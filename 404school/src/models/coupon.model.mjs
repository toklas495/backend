class Coupon{
    constructor(db){
        this.db = db;

        //binding
        this.getCoupon = this.getCoupon.bind(this);
        this.insert = this.insert.bind(this);
    }

    async getCoupon(coupon_code){
        try{
            return await this.db("coupons")
                        .where({code:coupon_code})
                        .first();
        }catch(error){
            throw error;
        }
    }

    async insert(payload){
        try{
            const [coupon] = await this.db("coupons").insert(payload).returning("*");
            return coupon;
        }catch(error){
            throw error;
        }
    }
}

export default Coupon;