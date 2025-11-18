import razorpay from '../config/razorpay.mjs';

//model 
import Order from '../models/order.model.mjs';
import Course from '../models/course.model.mjs'
import Student from '../models/student.model.mjs';
import Coupon from '../models/coupon.model.mjs';
import Payment from '../models/payment.model.mjs';
import crypto from 'crypto';
//db
import db from '../db/index.mjs';
import asynchandler from '../utils/asyncHandler.mjs'
import ApiError, { DUPLICATE, NOTFOUND } from '../utils/ApiError.mjs';

//env_constant
import env_constant from '../../env.config.mjs';

class CheckOutController{
    constructor(){

        this.courseDb = new Course(db);
        this.studentDb = new Student(db);
        this.couponDb = new Coupon(db);
        this.orderDb = new Order(db);
        this.paymentDb = new Payment(db);
        //binding

        this.createOrder = this.createOrder.bind(this);
        this.verifyPayment = this.verifyPayment.bind(this);
    }

    createOrder=asynchandler(async(req,reply)=>{
        const now = new Date();
        const {id:user_id} = req.user||{};
        const {course_id,batch_id,coupon_code="default_coupon"} = req.body;

        const isStudentExist = await this.studentDb.read({batch_id,user_id});
        if(isStudentExist) throw new DUPLICATE({event:"CREATE_ORDER",message:"sorry! you have already that batch"})
        // get batch and student 
        const [batch,student_count] = await Promise.all([
            this.courseDb.readBatchWithId(batch_id),
            this.studentDb.countStudents({batch_id}),
        ])

        // check batch,course_id or maximum students 
        if(!batch || batch.course_id!==course_id) throw new NOTFOUND({event:"CREATE_ORDER"});    
        if(batch.max_student<=student_count) throw new ApiError({message:"sorry! reached limit",event:"CREATE_ORDER",isKnown:true,status:"400"});
        
        const [coupon,course] = await Promise.all([
            this.couponDb.getCoupon(coupon_code),
            this.courseDb.read({course_id})
        ])

        const isValidCoupon = (
                        coupon&&
                        coupon.used_count<coupon.used_limit&&
                        now<=coupon.valid_until && now>=coupon.valid_from&&
                        coupon.min_purchase_amount<course.amount
                    )?true:false;
        
        let total_price = parseFloat(course.amount);
        let tax = parseFloat(0);
        let discount = parseFloat(course.discount_value);
        let final_price = 0;

        if(isValidCoupon){
            if(coupon.discount_type==="percentage"){
                final_price = ((total_price/100)*discount)-tax;
            }else if(coupon.discount_type==="fixed"){
                final_price = (total_price-discount)-tax;
            }
        }else{
            final_price = total_price-tax;
        }

        //place a order

        const order = await this.orderDb.insertOrder({
            order_number:`ORD-${Date.now().toString()}-${crypto.randomBytes(4).toString("hex")}`,
            user_id,
            course_id,
            batch_id,
            amount:total_price,
            discount,
            tax,
            total_amount:final_price,
            currency:course.currency,
            status:"pending",
            ...(isValidCoupon&&{coupon_code:coupon_code})
        })

        // razorpay order

        const razorpayOrder = await razorpay.orders.create({
            amount:Math.round(final_price*100),
            currency:course.currency,
            receipt:order.order_number,
            notes:{
                order_id:order.id,
                user_id:user_id,
                course_id:course_id,
            }
        })


        //payment
        const payment = await this.paymentDb.create({
            order_id:order.id,
            user_id:user_id,
            payment_gateway:"razorpay",
            gateway_order_id:razorpayOrder.id,
            amount:order.total_amount,
            currency:order.currency,
            status:"pending"
        })

        return {
            status:"ok",
            data:{
                razorPayOrderId:razorpayOrder.id,
                amount:razorpayOrder.amount,
                currency:razorpayOrder.currency,
                paymentId:payment.id
            }
        }

    })


    verifyPayment=asynchandler(async(req,reply)=>{
        const {id:user_id} = req.user||{};
        const {razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_id} = req.body;
        // verify payment
        const text = razorpay_order_id+"|"+razorpay_payment_id;
        const generated_signature = crypto.createHmac('sha256',env_constant.razorpay.razorpay_secret)
                                    .update(text)
                                    .digest("hex");
        
        
        if(generated_signature!==razorpay_signature) throw new ApiError({message:"Invalid payment signature",status:400,event:"VERIFY",isKnown:true});
        //fetch payment;
        const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
        if(razorpayPayment.status!=="captured" && razorpayPayment.status!=="authorized" && razorpayPayment.notes.user_id!==user_id){
            const payment = await this.paymentDb.markAsFailed(payment_id,razorpayPayment.error_reason);
            await this.orderDb.updateStatus(payment.order_id,"failed");
            throw new ApiError({message:"Payment not successful!",event:"VERIFY",status:401,isKnown:true});
        }

        const [payment,order,course] = await Promise.all([
            this.paymentDb.markAsSuccess(payment_id,razorpayPayment),
            this.orderDb.updateStatus(razorpayPayment.notes.order_id,"completed"),
            this.courseDb.read({course_id:razorpayPayment.notes.course_id})
        ])
        
       

        const studentData = {
            user_id:order.user_id,
            school_id:course.school_id,
            course_id:order.course_id,
            batch_id:order.batch_id,
            status:"active",
        } 

        const student = await this.studentDb.insertStudent(studentData);

        return {
            status:"ok",
            data:{
                payment:{...payment},
                student:{...student}
            }
        }
    })
}


export default CheckOutController;
