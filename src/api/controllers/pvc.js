import Joi from 'joi';
import boom from 'boom';
import request from 'request';
import fetch from 'node-fetch';
import _ from 'lodash';
import { URLSearchParams } from 'url';
import PVC from '../models/pvc';
import Helpers from './helpers';

const verifyViaApp = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      state: Joi.string(),
      state_id: Joi.string(),
      phone: Joi.string().required(),
      last_name: Joi.string().required(),
      first_name: Joi.string(),
      vin: Joi.string().required(),
      other_name: Joi.string(),
      lga: Joi.string(),
      latitude: Joi.number(),
      longitude: Joi.number(),
      gender: Joi.string(),
      profession: Joi.string(),
      ward: Joi.string(),
      dob: Joi.string(),
      polling_unit: Joi.string(),
    });
    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    let { state_id, phone, last_name, vin } = value;
    if (value.dob) {
      value.dob = Date(value.dob);
    }

    if(value.latitude && value.longitude) {
      value.geo = {
        coordinates: [value.longitude, value.latitude]
      };
    }
    
    //Check if Vin already exist
    const existPVC = await PVC.findOne({ vin });
    if (existPVC && existPVC.is_verified) {
      throw boom.badRequest('Vin already exist in DB ');
    }
   
   /* PVC exists but is not verified
      Maybe we can get more information
   */
    if (existPVC && !existPVC.is_verified) {
      await existPVC.remove();
    }

    //Verification Passed But Phone is Duplicate
    const existingPhone = await PVC.findOne({ phone });
    if (existingPhone && existingPhone.is_verified) {
      throw boom.badRequest('Vin already exist in DB ');
    }

    if (existingPhone && !existingPhone.is_verified) {
      await existingPhone.remove();
    }
    if (!state_id) {
      if (!value.state) {
        throw boom.badRequest('State is required!');
      }
      console.log(value.state);
      let index = Helpers.states_in_nigeria.indexOf(value.state.toLowerCase()) + 1;
      state_id = index.toString();
    }
    
    const params = new URLSearchParams();
    params.append('state_id', state_id);
    params.append('last_name', last_name.toLowerCase());
    params.append('vin', vin);
    console.log(params);
    const url = "http://voters.inecnigeria.org/Api/checkVoter";
    const response = await fetch(url, { method: 'post',
        body:    params,
        headers: { 'Authorization': process.env.PVC_VERIFICATION_KEY }, });
    const json = await response.json();
    
    
    if (json.error) {
      value.is_verified = false;
      value.verification_error = json.message;
    } else {
      value.is_verified = true;
    }

    value.campaign = req.campaign || null;
    value.submitted_by = req.user._id || null;
    
    const pvc = new PVC(value);

    let voter_info = {}
    if (json.voterInfo) {
      //Change all values to lower case to aid query during GET
      for (const key of Object.keys(json.voterInfo)) {
        voter_info[key] = _.mapValues(json.voterInfo[key], function(s, i) {
          if (i === 'vin') {
            return s;
          }
          return _.isString(s) ? s.toLowerCase() : s;
        });
      }
      pvc.voter_info = voter_info;
      if (!value.ward) {
        value.ward = json.voterInfo.Pu.ward;
      }
    }
    
    await pvc.save();
    const message =  pvc.is_verified ?'PVC verification was successful' : 'PVC verification failed';
    res.status(200).json(pvc);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const create = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      state: Joi.string(),
      state_id: Joi.string(),
      phone: Joi.string().required(),
      last_name: Joi.string().required(),
      first_name: Joi.string(),
      vin: Joi.string().required(),
      other_name: Joi.string(),
      lga: Joi.string(),
      latitude: Joi.number(),
      longitude: Joi.number(),
      gender: Joi.string(),
      profession: Joi.string(),
      dob: Joi.string(),
      ward: Joi.string(),
      polling_unit: Joi.string(),
    });
    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }

    if (value.dob) {
      value.dob = Date(value.dob);
    }
  
    if(value.latitude && value.longitude) {
      value.geo = {
        coordinates: [value.longitude, value.latitude]
      };
    }
    value.campaign = req.campaign || null;
    if (req.user) {
      value.submitted_by = req.user._id || null;
    }
    const pvc = new PVC(value);
    await pvc.save();
    res.status(200).json({success: true});
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const get = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      id: Joi.string().required(),
    });

    const { value, error } = Joi.validate(req.params, schema);
    if (error && error.details) {
      let message = 'ID of pvc is required.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const { id } = value;
    const pvc = await PVC.findById(id);
    if (!pvc) {
      throw boom.notFound('PVC not found');
    }
    res.status(200).json(pvc);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const smsAPIGet = async (req, res) => {
  try {
    const { page, perPage } = req.query;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(perPage, 10) || 10,
      lean: true
    }
    const pvcs = await PVC.paginate({}, options);
    const contacts = [];
    pvcs.docs.forEach((pvc) => {
      const val = {};
      val.last_name = pvc.last_name;
      val.state_id = pvc.state_id;
      val.phone = pvc.phone;
      val.vin = pvc.vin;
      val.first_name = pvc.first_name;
      val.other_names = pvc.other_names;
      val.gender = pvc.gender;
      val.occupation = pvc.profession;
      val.state_name = pvc.state; 
      contacts.push(val);
    });
    pvcs.docs = contacts
    res.status(200).json(pvcs);
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
    let q = { };
    const reqQuery = req.query;
    const { page, perPage } = reqQuery;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(perPage, 10) || 10,
      select: '-voter_info'
    }

    if (reqQuery.gender) {
      q['gender'] = reqQuery.gender;
    }

    if (reqQuery.profession) {
      q['profession'] = { "$regex": reqQuery.profession, "$options": "i" };
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
      q['phone'] = reqQuery.phone;
    }

    if (reqQuery.vin) {
      q['vin'] = reqQuery.vin;
    }

    if (reqQuery.campaign) {
      q['campaign'] = reqQuery.campaign;
    }

    if (reqQuery.state_name) {
      q['state'] = reqQuery.state_name;
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

    const pvcs = await PVC.paginate(q, options);
    res.status(200).json(pvcs);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const statistics = async (req, res) => {
  
  try {
    const schema = Joi.object().keys({
      type: Joi.string().required(),
    });

    const { value, error } = Joi.validate(req.query, schema);
    if (error && error.details) {
      let message = 'Enter type as post parameter.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }

    const { type } = value;
    let q = {};
    if (type === 'gender') {
      q = { $group : {'_id': '$gender', 'count' : { $sum : 1 }} };
    } else if (type === 'ward') {
      q = { $group : {'_id': '$ward', 'count' : { $sum : 1 }} };
    } else if (type === 'occupation') {
      q = { $group : {'_id': '$profession', 'count' : { $sum : 1 }} };
    } else {
      q = { $group : {'_id': '$lga', 'count' : { $sum : 1 }} };
    }
    const total_pvc = await PVC.count();
    PVC.aggregate([
      q,
      {$project: { 'count': '$count', 'percentage': {'$multiply': [ {'$divide': [100, total_pvc]}, '$count' ]}} },
      {$sort: { percentage: 1 }},
      ], function(err, result) {
      if (err) {
        boom.boomify(err);
        throw err;
      }
      res.json(result);
    })
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
  
};

const occupation = async (req, res) => {
  try {
    PVC.aggregate([
      { $group : { _id : '$profession' } }
      ], function(err, result) {
      if (err) {
        boom.boomify(err);
        throw err;
      }
      const vals = result.map(obj => obj._id);
      const unique = [...new Set(vals)]; 
      res.json(unique);
    })
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
  
};

export default {
  verifyViaApp,
  getAll,
  get,
  occupation,
  statistics,
  smsAPIGet,
  create,
};