const dbUrl = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const refressSecret = process.env.JWT_REFRESH_SECRET;
const serverPort = process.env.PORT;
const collectionName = process.env.COLLECTION;

// # Nodemailer configuration

const mailService = process.env.EMAIL_SERVICE;
const mailUserName = process.env.EMAIL_USERNAME;
const mailPassword = process.env.EMAIL_PASSWORD;
const emailName = process.env.EMAIL_NAME;

// # Mailchimp API key and list ID
const mailchimpKey = process.env.MAILCHIMP_API_KEY;
const mailchimpList = process.env.MAILCHIMP_LIST_ID;

// # Client Application Name
const applicaionName = process.env.APPLICATION_NAME;

// #client urls

const host = process.env.LOGINHOST;
const loginPath = process.env.CLIENTLOGINPAGE;
const resetPath = process.env.CLIENTRESETPASSURL;
const confirmPath = process.env.CLIENTCONFIRMURL;

module.exports = {
  dbUrl,
  jwtSecret,
  serverPort,
  collectionName,
  mailService,
  mailPassword,
  mailUserName,
  emailName,
  mailchimpKey,
  mailchimpList,
  applicaionName,
  host,
  loginPath,
  resetPath,
  confirmPath,refressSecret
};
