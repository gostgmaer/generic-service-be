const express = require("express");
// var session = require("express-session");
const authRoute = express.Router();

const {
    registerUser,loginUser,getUserProfile
//   signIn,
//   resetPassword,
//   singout,
//   varifySession,
//   changedPassword,
//   forgetPassword,
//   accountConfirm,getProfile,getRefreshToken
} = require("../controllers/auth");
// const UpdatebyMiddleWare = require("../middleware/updatedBy");
const authenticateUser = require("../middlewares/authMiddleware");
const addMetadata = require("../middlewares/metadata");

const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignIpRequest,
  validateForgetPassword,
  validateResetpassword,
  validateChangePassword
} = require("../utils/validators/auth");


authRoute.route("/user/auth/register").post(validateSignUpRequest, isRequestValidated,registerUser,addMetadata);
// authRoute.route("/user/auth/confirm-account/:token").post(accountConfirm);
authRoute.route("/user/auth/login").post(validateSignIpRequest, isRequestValidated,loginUser);
// authRoute.route("/user/auth/verify/session").post(varifySession);
// authRoute.route("/user/auth/session/refresh/token").post(getRefreshToken);
// authRoute.route("/user/auth/reset-password/:token").post(validateResetpassword,isRequestValidated,resetPassword);
// authRoute.route("/user/auth/forget-password").post(validateForgetPassword,isRequestValidated,forgetPassword);
// authRoute.route("/user/auth/change-password").post(userMiddleWare,UpdatebyMiddleWare,validateChangePassword,isRequestValidated,changedPassword);
authRoute.route("/user/auth/profile").get(authenticateUser,getUserProfile);
// authRoute.route("/user/auth/logout").post(userMiddleWare,singout);

module.exports = authRoute;
