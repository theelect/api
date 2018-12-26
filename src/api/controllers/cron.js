import schedule from 'node-schedule';
import SMS from '../models/sms';

const credentials = {
    apiKey: process.env.SMS_APIKEY,
    username: process.env.SMS_USERNAME, 
};
const AfricasTalking = require('africastalking')(credentials);

const sms = AfricasTalking.SMS;

const updateScheduledSMS = async () => {
  try {
    const scheduledSMS = await SMS.find({ scheduledDate: { $lte: new Date() }, is_scheduled: true });
    if (scheduledSMS.length === 0) {
        return
    }
    scheduledSMS.forEach( async (val) => {
      const options = {
        to: val.to,
        message: val.message,
        from: val.from,
      };
      const response = await sms.send(options);
      const recipients = response.SMSMessageData.Recipients;
      val.recipients = recipients;
      val.scheduledDate = null;
      val.is_scheduled = false;
      await val.save();
    });
  } catch (error) {
    console.log('# Schedule Message error', error);
  }
};

const scheduleJobs = () => {
  const rule = new schedule.RecurrenceRule();
  rule.minute = new schedule.Range(0, 59, 5); // Run every 5 minutes
  schedule.scheduleJob(rule, () => {
    updateScheduledSMS();
  });
};

export default {
  scheduleJobs,
};