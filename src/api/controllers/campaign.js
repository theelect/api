import Joi from 'joi';
import boom from 'boom';
import Campaign from '../models/campaign';

const create = async (req, res) => {
  try {
      
    if (req.user.role !== 'admin') {
      throw boom.unauthorized('You do not have permission to create campaign.');
    }
    const schema = Joi.object().keys({
      apiKey: Joi.string().required(),
      name: Joi.string().required(),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const campaign = Campaign(value);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const getAll = async (req, res) => {
  try {
    if (req.user.role != 'admin') {
      throw boom.unauthorized('You do not have permission to create campaign.');
    }
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

export default {
  getAll,
  create,
};