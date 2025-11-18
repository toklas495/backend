

class Order{
    constructor(db){
        this.db = db;
        //binding

        this.insertOrder = this.insertOrder.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.findByOrderNumber = this.findByOrderNumber.bind(this);
        this.findById = this.findById.bind(this);
        this.getUserOrders = this.getUserOrders.bind(this);
    }
    
    async insertOrder(payload){
        try{
            const [order] = await this.db("orders")
                            .insert(payload)
                            .returning("*");
            return order;
        }catch(error){  
            throw error;
        }
    }

    async updateStatus(orderId,status){
        try{
            const [order] = await this.db("orders")
                            .where({"id":orderId})
                            .update({status,updated_at:this.db.fn.now()})
                            .returning("*");
            return order;
        }catch(error){
            throw error;
        }
    }

    async findById(orderId){
        try{
            return await this.db('orders').where({id:orderId}).first();
        }catch(error){
            throw error;
        }
    }

    async findByOrderNumber(orderNumber){
        try{
            return await this.db("orders").where({order_number:orderNumber}).first();
        }catch(error){
            throw error;
        }
    }

    async getUserOrders(user_id){
        try{
            return await this.db("orders")
                .where({user_id:user_id})
                .leftJoin('school_course',"orders.course_id","school_course.id")
                .leftJoin("batch_course","orders.batch_id","batch_course.id")
                .select(
                    "orders.*",
                    "school_course.name as course_title",
                    "batch_course.batch_name"
                ).orderBy("orders.created_at","desc");
        }catch(error){
            throw error;
        }
    }
}


export default Order;