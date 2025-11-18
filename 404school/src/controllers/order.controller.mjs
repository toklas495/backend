import db from "../db/index.mjs"
import Order from "../models/order.model.mjs"
import { FORBIDDEN, NOTFOUND } from "../utils/ApiError.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

class OrderController{
    constructor(){
        this.db = new Order(db);

        //binding
        this.getOrderDetail= this.getOrderDetail.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
    }

    //get order detail
    getOrderDetail = asyncHandler(async(req,res)=>{
        const {orderId} = req.params;
        const {id:user_id} = req.user||{};

        const order = await this.db.findById(orderId);
        if(!order) throw new NOTFOUND({event:"GET_ORDER_DETAIL",message:"Order Not Found!"});
        if(order.user_id!==user_id) throw new FORBIDDEN({event:"GET_ORDER_DETAIL"});
        return {
            status:"ok",
            data:order
        }
    })


    // get user details 

    getUserDetails = asyncHandler(async(req,res)=>{
        const {id:user_id} = req.user;
        const orders = await this.db.getUserOrders(user_id);
        console.log(orders);
        return {
            status:"ok",
            data:orders
        }
    })


}

export default OrderController;