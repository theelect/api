import Joi from 'joi';
import boom from 'boom';
import LGA from '../models/lga';
import PVC from '../models/pvc';

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

const mapData = async (req, res) => {
  try {
    const q = { $group : {'_id': '$lga', 'lga_id': { $first: '$lga_id' }, 'count' : { $sum : 1 }} };
    const total_pvc = await PVC.count();
    PVC.aggregate([
      q
      ], function(err, result) {
      if (err) {
        boom.boomify(err);
        throw err;
      }
      let mapJSON = [];
      const opt = [{lga_id: 'lga'}];
      LGA.populate(result, {path: "lga_id"}, (err, lgas) => {
        lgas.forEach((val, index) => {
          if (val.lga_id) {
            const json = [val.lga_id.map_code, val.count.toString()];
            mapJSON.push(json);
          }
        });
        res.status(200).json(mapJSON);
      });      
    });
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
  mapData,
};

