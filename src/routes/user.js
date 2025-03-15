const express = require("express");

const userRouter = express.Router();


const {
  getusers,getSingleUser,removeUser,userUpdate
} = require("../controllers/user");

userRouter.route("/users").get( getusers);
userRouter.route("/users/:id").get(getSingleUser);
userRouter.route("/users/:id").patch(userUpdate);
userRouter.route("/users/:id").put(userUpdate);
userRouter.route("/users/:id").delete(removeUser);


module.exports = userRouter;
