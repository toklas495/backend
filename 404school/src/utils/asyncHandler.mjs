// utils/asyncHandler.mjs
const asyncHandler = (reqFun) => {
  return async (req, reply) => {
    try {
      return await reqFun(req, reply);
    } catch (error) {
      throw error;
    }
  };
};

export default asyncHandler;