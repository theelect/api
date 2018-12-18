import schedule from 'node-schedule';
import ScheduledSMS from '../models/scheduledSMS';
import SMS from '../models/sms';

const credentials = {
    apiKey: process.env.SMS_APIKEY,
    username: process.env.SMS_USERNAME, 
};
const AfricasTalking = require('africastalking')(credentials);

const sms = AfricasTalking.SMS;

const updateScheduledSMS = async () => {
  try {
    const scheduledSMS = await ScheduledSMS.find({ date: { $lte: new Date() }});
    if (scheduledSMS.length === 0) {
        return
    }
    scheduledSMS.forEach( async (val) => {
        console.log('## sent scheduled sms');
      const options = {
        to: val.to,
        message: val.message,
        from: val.from,
      };
      const response = await sms.send(options);
      const recipients = response.SMSMessageData.Recipients;
      const anSMS = new SMS({
        status: 'Sent',
        message: val.message,
        number_of_recipient: val.to.length,
        recipients
      });
      await anSMS.save();
      await val.remove();
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