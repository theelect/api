import Joi from 'joi';
import boom from 'boom';
import LGA from '../models/lga';

const create = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      state_id: Joi.string().required(),
      name: Joi.string().required(),
      wards: Joi.array().required(),
    });
    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing.';
      if (error.details[0]) {
        message = error.details[0].message;
      }
      throw boom.badRequest(message);
    }
    // value.wards = req.body.wards;
    console.log('###', value);
    const lga = new LGA(value);
    await lga.save();
    res.status(201).json(lga);
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
    const q = {}
    if (req.query.state_id) {
      q['state_id'] = req.query.state_id;
    }
    const lgas = await LGA.find(q);
    res.status(200).json(lgas);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
  
};

export default {
  create,
  getAll,
};