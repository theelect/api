import boom from 'boom';
import Joi from 'joi';
import PVC from '../models/pvc';
import SMS from '../models/sms';

const credentials = {
    apiKey: process.env.SMS_APIKEY,
    username: process.env.SMS_USERNAME, 
};
const AfricasTalking = require('africastalking')(credentials);

const sms = AfricasTalking.SMS;

const getMessages = async (req, res) => {
  try {
    const sms = await SMS.find();
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
      q['phone'] = '+' + reqQuery.phone.trim();
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
    const sms = AfricasTalking.SMS;
    const options = {
      to: phones,
      message,
      enqueue: phones.length > 5000,
    };
    const response = await sms.send(options);
    const recipients = response.SMSMessageData.Recipients;
    const anSMS = new SMS({
      status: 'Sent',
      message,
      number_of_recipient: phones.length,
      recipients
    });
    await anSMS.save();
    res.status(200).json(response);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

export default { sendSMS, getMessages };

