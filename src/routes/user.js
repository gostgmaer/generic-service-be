const express = require("express");
var session = require("express-session");
const userRouter = express.Router();
const UpdatebyMiddleWare = require("../middleware/updatedBy");
const createMiddleWare = require("../middleware/createMiddleWare");
const userMiddleWare = require("../middleware/userAccess");
const adminMiddleware = require("../middleware/adminAccess");


const {
  updateUser,
  getusers,
  deleteUser,getSingleUser
} = require("../controller/user");

userRouter.route("/users").get(adminMiddleware, getusers);
userRouter.route("/users/:id").get(userMiddleWare,getSingleUser);
userRouter.route("/users/:id").patch(userMiddleWare,UpdatebyMiddleWare,updateUser);
userRouter.route("/users/:id").put(userMiddleWare,UpdatebyMiddleWare,updateUser);
userRouter.route("/users/:id").delete(adminMiddleware,deleteUser);


module.exports = userRouter;
