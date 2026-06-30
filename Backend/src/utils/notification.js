const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { format } = require('util');

require('dotenv').config();

const emailPort = Number(process.env.SMTP_PORT) || 587;
let emailSecure = emailPort === 465;

if (typeof process.env.SMTP_SECURE !== 'undefined') {
  const envSecure = process.env.SMTP_SECURE === 'true';
  if (emailPort === 465) {
    emailSecure = envSecure;
  } else if (emailPort === 587 && envSecure) {
    console.warn('SMTP_SECURE=true is invalid for port 587; using secure=false with STARTTLS.');
    emailSecure = false;
  } else {
    emailSecure = envSecure;
  }
}

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: emailPort,
  secure: emailSecure,
  requireTLS: emailPort === 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const smsConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  from: process.env.TWILIO_FROM_NUMBER,
};

let emailTransporter;
let smsClient;

const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;
  if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error('SMTP configuration is required for email delivery');
  }
  emailTransporter = nodemailer.createTransport(emailConfig);
  return emailTransporter;
};

const getSmsClient = () => {
  if (smsClient) return smsClient;
  if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.from) {
    throw new Error('Twilio configuration is required for SMS delivery');
  }
  smsClient = twilio(smsConfig.accountSid, smsConfig.authToken);
  return smsClient;
};

exports.sendEmailOtp = async ({ to, code }) => {
  const transporter = getEmailTransporter();
  const message = {
    from: process.env.SMTP_FROM || emailConfig.auth.user,
    to,
    subject: 'TataCaliq OTP Code',
    text: format('Your OTP code is %s. It is valid for 5 minutes.', code),
    html: format('<p>Your OTP code is <strong>%s</strong>.</p><p>It is valid for 5 minutes.</p>', code),
  };

  return transporter.sendMail(message);
};

exports.sendSmsOtp = async ({ to, code }) => {
  const client = getSmsClient();
  return client.messages.create({
    body: `Your OTP code is ${code}. It is valid for 5 minutes.`,
    from: smsConfig.from,
    to,
  });
};

const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  if (phone.startsWith('+')) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return `+${digits}`;
};

exports.sendOtpNotification = async ({ email, phone, code }) => {
  if (email) {
    return exports.sendEmailOtp({ to: email, code });
  }

  if (phone) {
    const to = formatPhoneNumber(phone);
    return exports.sendSmsOtp({ to, code });
  }

  throw new Error('Email or phone is required to deliver OTP');
};
