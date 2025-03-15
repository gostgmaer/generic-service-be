const express = require("express");
// var session = require("express-session");
const authRoute = express.Router();

const {
    registerUser,loginUser,getUserProfile,refreshToken,signOutUser,resetPassword,changePassword,confirmEmail,sendResetPasswordEmail
} = require("../controllers/auth");
// const UpdatebyMiddleWare = require("../middleware/updatedBy");
const authenticateUser = require("../middlewares/authMiddleware");
// const addMetadata = require("../../middlewares/metadata");

const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignIpRequest,
  validateForgetPassword,
  validateResetpassword,
  validateChangePassword
} = require("../utils/validators/auth");


authRoute.route("/user/auth/register").post(validateSignUpRequest, isRequestValidated,registerUser);
authRoute.route("/user/auth/confirm-account/:token").post(confirmEmail);
authRoute.route("/user/auth/login").post(validateSignIpRequest, isRequestValidated,loginUser);
authRoute.route("/user/auth/session/token").post(refreshToken);
authRoute.route("/user/auth/reset-password/:token").post(validateResetpassword,isRequestValidated,resetPassword);
authRoute.route("/user/auth/forget-password").post(validateForgetPassword,isRequestValidated,sendResetPasswordEmail);
authRoute.route("/user/auth/change-password").post(authenticateUser,validateChangePassword,isRequestValidated,changePassword);
authRoute.route("/user/auth/profile").get(authenticateUser,getUserProfile);
authRoute.route("/user/auth/logout").post(authenticateUser,signOutUser);

module.exports = authRoute;
