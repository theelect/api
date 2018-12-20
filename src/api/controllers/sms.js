import boom from 'boom';
import moment from 'moment';
import Joi from 'joi';
import PVC from '../models/pvc';
import SMS from '../models/sms';

const credentials = {
    apiKey: process.env.SMS_APIKEY,
    username: process.env.SMS_USERNAME, 
};
const AfricasTalking = require('africastalking')(credentials);


const cancelScheduledSMS = async (req, res) => {
  const { id } = req.params;
  try {
    const sms = await SMS.findById(id);
    if (!sms) {
      throw boom.notFound('No scheduled sms with such id was found');
    }
    await sms.remove();
    res.status(200).json({ message: 'Scheduled sms has been canceled.' });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const updateScheduledSMS = async (req, res) => {
  const { id } = req.params;
  try {
    const schema = Joi.object().keys({
      message: Joi.string().required(),
      schedule_date: Joi.string(),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Message is required.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const sms = await SMS.findById(id);
    if (!sms) {
      throw boom.notFound('No scheduled sms with such id was found');
    }

    const date = new Date(value.schedule_date);
    sms.message = value.message;
    sms.date = date;
    await sms.save();
    res.status(200).json(sms);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const getMessages = async (req, res) => {
  try {
    let q = {};
    if (req.query.is_scheduled) {
      q['is_scheduled'] = req.query.is_scheduled;
    }
    const sms = await SMS.find(q);
    res.status(200).json(sms);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const sendSMS = async (req, res) => {

  try {
    let q = { };
    const reqQuery = req.query;

    if (reqQuery.gender) {
      q['gender'] = reqQuery.gender;
    }

    if (reqQuery.profession) {
      const professions = reqQuery.profession.split(',');
      const regex = professions.join('|');
      q['profession'] = { "$regex": regex, "$options": "i" };
    }

    if (reqQuery.is_verified) {
        q['is_verified'] = reqQuery.is_verified;
    }

    if (reqQuery.submitted_by) {
      q['submitted_by'] = reqQuery.submitted_by;
    }

    if (reqQuery.first_name) {
      q['first_name'] = reqQuery.first_name;
    }

    if (reqQuery.last_name) {
      q['last_name'] = reqQuery.last_name;
    }

    if (reqQuery.phone) {
      let p = reqQuery.phone.trim();
      if (p.charAt(0) !== '+') {
        p = '+' + p;
      }
      q['phone'] = p;
    }

    if (reqQuery.vin) {
      q['vin'] = reqQuery.vin;
    }

    if (reqQuery.campaign) {
      q['campaign'] = reqQuery.campaign;
    }

    if (reqQuery.state_name) {
      const states = reqQuery.state.split(',');
      q['state'] = { '$in': states };
    }

    if (reqQuery.lga) {
      const lgas = reqQuery.lga.split(',');
      q['lga'] = { '$in': lgas };
    }

    if (reqQuery.ward) {
      const wards = reqQuery.ward.split(',');
      q['ward'] = { '$in': wards };
    }

    if (reqQuery.entry_start_date && reqQuery.entry_end_date) {
      q['created_at'] = {
        $gte: new Date(reqQuery.entry_start_date),
        $lte: new Date(reqQuery.entry_end_date),
      }
    } else if (reqQuery.entry_start_date) {
      q['created_at'] = {
        $gte: new Date(reqQuery.entry_start_date),
      }
    } else if (reqQuery.entry_end_date) {
      q['created_at'] = {
        $lte: new Date(reqQuery.entry_end_date),
      }
    
    }

    const date = new Date();
    if (reqQuery.age) {
      let ageQuery = [];
      const ageRanges = reqQuery.age.split(',');
      ageRanges.forEach((range) => {
        const ageLimits = range.split('-');
        const min = parseInt(ageLimits[0], 10);
        const max = parseInt(ageLimits[1], 10);
        ageQuery.push({ dob: {
          $gte: moment(date).subtract(max, 'years'),
          $lte: moment(date).subtract(min, 'years')
        }});
      });
      q['$or'] = ageQuery;
    }

    const schema = Joi.object().keys({
      message: Joi.string().required(),
      is_scheduled: Joi.boolean().required(),
      schedule_date: Joi.string(),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Message is required.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const { message } = value;
    const pvcs = await PVC.find(q);
    
    if (pvcs.length === 0) {
      throw boom.badRequest('No user found for selected query');
    }
    const phones = pvcs.map((pvc) => pvc.phone );
    if (value.is_scheduled) {
      if (!req.body.schedule_date) {
        throw boom.badRequest('Scheduled sms requires a date');
      }
      const date = new Date(value.schedule_date);
      const anSMS = new SMS({
        status: 'Scheduled',
        message: message,
        number_of_recipient: phones.length,
        recipients: [],
        to: phones,
        is_scheduled: true,
        scheduledDate: date,
      });
      await anSMS.save();
      res.status(200).json({ message: 'SMS has been scheduled.' });
    } else {
      const sms = AfricasTalking.SMS;
      const options = {
        to: phones,
        message,
        from: 'TonyeCole'
      };
      const response = await sms.send(options);
      const recipients = response.SMSMessageData.Recipients;
      const anSMS = new SMS({
        status: 'Sent',
        message,
        number_of_recipient: phones.length,
        recipients: recipients
      });
      await anSMS.save();
      res.status(200).json(response);
    }
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const stats = async (req, res) => {
  try {
    const date = new Date(), y = date.getFullYear(), m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const total_sent_sms = await SMS.count();
    const total_sent_this_month = await SMS.count({ createdAt: { $gte: firstDay, $lte: lastDay }});
    const total_scheduled_sms = await SMS.count({ is_scheduled: true });
    res.status(200).json({ 
      total_sent_sms,
      total_sent_this_month,
      total_scheduled_sms
    });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

export default { 
  sendSMS, 
  getMessages,
  cancelScheduledSMS,
  updateScheduledSMS,
  stats,
};

