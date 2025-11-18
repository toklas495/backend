import Razorpay from 'razorpay';
import env_constant from '../../env.config.mjs';

const razorpay = new Razorpay({
    key_id:env_constant.razorpay.razorpay_key,
    key_secret:env_constant.razorpay.razorpay_secret
})

export default razorpay;