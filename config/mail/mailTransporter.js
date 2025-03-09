// emailService.js
const {
  mailService,
  mailPassword,
  mailUserName,
} = require("../config/setting");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const mandrillTransport = require("nodemailer-mandrill-transport");
dotenv.config();

// Create and export the Nodemailer transporter

let Mailconfig = {
  service: mailService,
  auth: {
    user: mailUserName,
    pass: mailPassword,
  },
};

const transporter = nodemailer.createTransport(Mailconfig);

module.exports = transporter;
