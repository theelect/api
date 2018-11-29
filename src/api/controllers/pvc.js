import Joi from 'joi';
import boom from 'boom';
import request from 'request';
import fetch from 'node-fetch';
import _ from 'lodash';
import { URLSearchParams } from 'url';
import PVC from '../models/pvc';

const verifyViaApp = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      state_id: Joi.string().required(),
      phone: Joi.string().required(),
      last_name: Joi.string().required(),
      vin: Joi.string().required(),
    });
    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }
    const { state_id, phone, last_name, vin } = value;

    //Check if Vin already exist
    const existPVC = await PVC.findOne({ vin });
    if (existPVC && existPVC.is_verified) {
      throw boom.badRequest('Vin already exist in DB ');
    }
   
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

    const params = new URLSearchParams();
    params.append('state_id', state_id);
    params.append('last_name', last_name);
    params.append('vin', vin);

    const url = "http://voters.inecnigeria.org/Api/checkVoter";
    const response = await fetch(url, { method: 'post',
        body:    params,
        headers: { 'Authorization': process.env.PVC_VERIFICATION_KEY }, });
    const json = await response.json();
    
    if (json.error) {
      value.campaign = req.campaign || null;
      value.submitted_by = req.user._id || null;
      value.is_verified = false;
      value.verification_error = json.message;
      const pvc = new PVC(value);
      await pvc.save();
      const error = new Error(json.message);
      boom.boomify(error, { statusCode: 400 });
      throw error;
    }

    value.campaign = req.campaign || null;
    value.submitted_by = req.user._id || null;
    value.is_verified = true;
    const pvc = new PVC(value);

    let voter_info = {}

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
    await pvc.save();
    res.status(200).json(pvc);
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
      if (pvc.voter_info) {
        if (pvc.voter_info.Voter) {
          val.first_name = pvc.voter_info.Voter.first_name || '';
          val.other_names = pvc.voter_info.Voter.other_names || '';
          val.gender = pvc.voter_info.Voter.gender || '';
          val.occupation = pvc.voter_info.Voter.occupation || '';
        }
        if (pvc.voter_info.State) {
          val.state_name = pvc.voter_info.State.name || '';
        }
      }
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
    }

    if (reqQuery.gender) {
      q['voter_info.Voter.gender'] = reqQuery.gender;
    }

    if (reqQuery.occupation) {
      q['voter_info.Voter.occupation'] = { "$regex": reqQuery.occupation, "$options": "i" };
    }

    if (reqQuery.is_verified) {
        q['is_verified'] = reqQuery.is_verified;
    }

    if (reqQuery.submitted_by) {
      q['submitted_by'] = reqQuery.submitted_by;
    }

    if (reqQuery.first_name) {
      q['voter_info.Voter.first_name'] = reqQuery.first_name;
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

    if (reqQuery.state_id) {
      q['state_id'] = reqQuery.state_id;
    }

    if (reqQuery.state_name) {
      q['voter_info.Voter.State.name'] = reqQuery.state_name;
    }

    if (reqQuery.lga) {
      const lgas = reqQuery.lga.split(',');
      q['voter_info.Pu.lga'] = { '$in': lgas };
    }

    if (reqQuery.ward) {
      const wards = reqQuery.ward.split(',');
      q['voter_info.Pu.ward'] = { '$in': wards };
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

     if (reqQuery.pvc_registration_start_date && reqQuery.pvc_registration_end_date) {
      q['voter_info.Voter.int_created'] = {
        $gte: new Date(reqQuery.pvc_registration_start_date),
        $lte: new Date(reqQuery.pvc_registration_end_date),
      }
    } else if (reqQuery.pvc_registration_start_date) {
      q['voter_info.Voter.int_created'] = {
        $gte: new Date(reqQuery.pvc_registration_start_date),
      }
    } else if (reqQuery.pvc_registration_end_date) {
      q['voter_info.Voter.int_created'] = {
        $lte: new Date(reqQuery.pvc_registration_end_date),
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
      q = { $group : {'_id': '$voter_info.Voter.gender', 'count' : { $sum : 1 }} };
    } else if (type === 'ward') {
      q = { $group : {'_id': '$voter_info.Pu.ward', 'count' : { $sum : 1 }} };
    } else if (type === 'occupation') {
      q = { $group : {'_id': '$voter_info.Voter.occupation', 'count' : { $sum : 1 }} };
    } else {
      q = { $group : {'_id': '$voter_info.Pu.lga', 'count' : { $sum : 1 }} };
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
      { $group : { _id : '$voter_info.Voter.occupation' } }
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
};