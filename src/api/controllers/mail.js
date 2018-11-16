import Mailgun from 'mailgun-js';

const sendSimpleMail = (data) => {
  const mailData = {
    from: data.from,
    to: data.to,
    subject: data.subject,
    text: data.text,
  };
  const mailgun = new Mailgun({
    apiKey: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
  mailgun.messages().send(mailData);
};

export default {
  sendSimpleMail,
};