import {v2 as cloudinary} from 'cloudinary';
import env_constant from '../../env.config.mjs';

cloudinary.config({
    cloud_name:env_constant.cloudinary.name,
    api_key:env_constant.cloudinary.api_key,
    api_secret:env_constant.cloudinary.api_secret
})

export default cloudinary;