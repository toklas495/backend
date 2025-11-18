//db
import db from '../db/index.mjs';
//model
import Coupon from '../models/coupon.model.mjs';
import UserDb from '../models/user.model.mjs';
import { FORBIDDEN, NOTFOUND } from '../utils/ApiError.mjs';

//utils
import asyncHandler from '../utils/asyncHandler.mjs';

class CouponController{
    constructor(){
        this.db = new Coupon(db);
        this.userdb = new UserDb(db);
        //binding   
        
        this.createCoupon = this.createCoupon.bind(this);

    }

    createCoupon = asyncHandler(async(req,res)=>{
        const {id:user_id} = req.user||{};
        const {code,discount_type,
            discount_value,min_puchase_amount,
            max_discount_amount,usage_limit,valid_from,valid_until} = req.body;
        // first check user must be admin
        const user = await this.userdb.read(user_id);
        if(!user) throw new NOTFOUND({event:"CREATE_COUPON"});
        if(!["admin"].some(role=>role===user.role)) throw new FORBIDDEN({event:"CREATE_COUPON",message:"only admin can insert coupon so sorry!"});

        const payload = {
            code,discount_type,discount_value,min_puchase_amount,max_discount_amount,usage_limit,valid_from,valid_until
        }

        const coupon = await this.db.insert(payload);
        return {
            status:"ok",
            data:coupon
        }
    })  
}

export default CouponController;