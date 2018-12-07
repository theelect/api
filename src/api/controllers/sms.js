import boom from 'boom';
import Joi from 'joi';

const credentials = {
    apiKey: process.env.SMS_APIKEY,
    username: process.env.SMS_USERNAME, 
};
const AfricasTalking = require('africastalking')(credentials);

const sms = AfricasTalking.SMS;

const getMessages = async (req, res) => {
  try {
    const lastReceivedId = req.params.lastReceivedId || 0;
    const messages = await sms.fetchMessages({ lastReceivedId });
    console.log(messages);
    res.status(200).json(messages);
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
    const schema = Joi.object().keys({
      pvcs: Joi.array().items(Joi.string().required()),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Array of pvc is required.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const options = {
      to: value.pvcs,
      message: 'Testing Tonye Cole',
    };
    const response = await sms.send(options);
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

