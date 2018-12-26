import { Pool } from 'pg';
import boom from 'boom';
import phone from 'phone';
import Joi from 'joi';
import _ from 'lodash';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import PVC from '../models/pvc';
import Voter from '../models/voter';
import LGA from '../models/lga';


const verifyVoter = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      state: Joi.string().required(),
      last_name: Joi.string().required(),
      vin: Joi.string().required(),
      phone_number: Joi.string().required(),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing.';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }

    let index = states_in_nigeria.indexOf(value.state.toLowerCase()) + 1;
    if (!index) {
      throw boom.badRequest('Invalid state');
    }
    const state_id = index.toString();
    
    //Validate Phone number
    const val = phone(value.phone_number, 'NG');
    if (val.length === 0) {
      return res.status(400).json({ 
        "error": true,
        "error_code": 400,
        message: 'Invalid phone number' });
    }
    value.phone_number = val[0];

    let { last_name, vin } = value;
    const params = new URLSearchParams();
    params.append('state_id', state_id);
    params.append('last_name', last_name.toLowerCase());
    params.append('vin', vin);
   
    const url = "http://voters.inecnigeria.org/Api/checkVoter";
    const response = await fetch(url, { method: 'post',
        body:    params,
        headers: { 'Authorization': process.env.PVC_VERIFICATION_KEY }, });
    const json = await response.json();
    res.status(200).json(json);

    //Save to our DB
    let voter_info = {};
    if (json.voterInfo) {
      for (const key of Object.keys(json.voterInfo)) {
        voter_info[key] = _.mapValues(json.voterInfo[key], function(s, i) {
          if (i === 'vin') {
            return s;
          }
          return _.isString(s) ? s.toLowerCase() : s;
        });
      }
      const voter = new Voter({
        first_name: voter_info.Voter.first_name,
        last_name: voter_info.Voter.last_name,
        other_names: voter_info.Voter.other_names,
        vin_full: voter_info.Voter.vin,
        gender: voter_info.Voter.gender,
        profession: voter_info.Voter.occupation,
        vin: value.vin,
        state_id: value.state_id,
        state_name: voter_info.State.name,
        lga_name: voter_info.Pu.lga,
        ward: voter_info.Pu.ward,
        polling_unit: voter_info.Pu.pu,
        phone: value.phone_number
      });
      voter.save();
    }
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).json({ 
      error: true,
      error_code: err.status,
      message: err.message });
  }
};

// const pool = new pg.Pool();
const cron = () => {
    const connectionString = 'postgresql://theelect:fightthegoodfight@the-elect-africa.ch1fckjskaiv.us-east-1.rds.amazonaws.com:5432/theelect'
  const pool = new Pool({
    user: 'theelect',
    host: 'the-elect-africa.ch1fckjskaiv.us-east-1.rds.amazonaws.com',
    database: 'theelect',
    password: 'fightthegoodfight',
    port: '5432'
  });

  pool.on('connect', () => {
      console.log('########## connected to POSTGRESQL');
  });

  pool.query('SELECT * FROM elect.rivers_recon WHERE lga=$1', ['OBIO_AKPOR'], (err, result) => {
        pool.end();
         console.log(err);
        // console.log(result.rows);
        result.rows.forEach((row) => {
            const vinN = row.vin.replace(/\s/g,'');
            const value = {
              state: 'rivers',
              state_id: '33',
              phone: row.phonenumber,
              last_name: row.last_name.toLowerCase(),
              first_name: row.first_name.toLowerCase(),
              vin: vinN.slice(-6),
              lga: 'obio-akpor',
              latitude: 4.7874679,
              longitude: 7.1062562,
              gender: row.gender.toLowerCase(),
              profession: row.profession.toLowerCase(),
              ward: wards[Math.floor(Math.random()*wards.length)].toLocaleLowerCase(),
              dob: _.random(1940, 2000).toString(),
              vin_full: vinN,
            };
            verifyViaApp(value);
        });
  });
}

const verifyViaApp = async (value) => {
  try {
    let { state_id, phone, last_name, vin } = value;
    if (value.dob) {
      value.dob = new Date(value.dob);
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
      let index = states_in_nigeria.indexOf(value.state.toLowerCase()) + 1;
      state_id = index.toString();
    }
    
    const params = new URLSearchParams();
    params.append('state_id', state_id);
    params.append('last_name', last_name.toLowerCase());
    params.append('vin', vin);
   
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
      if (!value.ward || value.ward === '') {
        if (pvc.voter_info.Pu) {
          pvc.ward = pvc.voter_info.Pu.ward;
        }
      }
    }
    await pvc.save();
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
  }
};

const updatePhoneNumbers = async () => {
  try {
    const pvcs = await PVC.find();
    pvcs.forEach((pvc) => {
      if (pvc.phone.charAt(0) !== '+') {
        let phone = pvc.phone.substring(1);
        phone = '+234' + phone;
        pvc.phone = phone;
        pvc.save();
      }
    })
  } catch (error) {
    boom.boomify(error);
    console.log(error);
  }
};

const updateLGA = async () => {
  try {
    const pvcs = await PVC.find();
    pvcs.forEach(async(pvc) => {
      console.log('### loop');
      if (!pvc.lga_id) {
        console.log('@@@ if', pvc.lga);
        const lga = await LGA.findOne({ name: pvc.lga });
        console.log('$$$$ if', lga);
        if (lga) { 
        console.log('###', lga._id);
        pvc.lga_id = lga._id;
        await pvc.save();
      }
        
      }
    })
  } catch (error) {
    boom.boomify(error);
    console.log(error);
  }
};



export default {
  verifyVoter,
  states_in_nigeria,
  cron,
  updatePhoneNumbers,
  updateLGA,
};

const wards = [ 
        "choba", 
        "elelenwo", 
        "oro-igwe", 
        "Ozuoba-Ogbogoro", 
        "Rukpokwu", 
        "Rumueme (7a)", 
        "Rumueme (7b)", 
        "Rumueme (7c)", 
        "Rumuigbo", 
        "Rumukwuta", 
        "Rumuodara", 
        "Rumuodomaya", 
        "Rumuokoro", 
        "Rumuokwu", 
        "Rumuolumeni", 
        "Rumuomasi", 
        "Woji (ward)"
    ];

const states_in_nigeria = [
  "abia",
  "adamawa",
  "akwa ibom",
  "anambra",
  "bauchi",
  "bayelsa",
  "benue",
  "borno",
  "cross River",
  "delta",
  "ebonyi",
  "enugu",
  "edo",
  "ekiti",
  "fct",
  "gombe",
  "imo",
  "jigawa",
  "kaduna",
  "kano",
  "katsina",
  "kebbi",
  "kogi",
  "kwara",
  "lagos",
  "nasarawa",
  "niger",
  "ogun",
  "ondo",
  "osun",
  "oyo",
  "plateau",
  "rivers",
  "sokoto",
  "taraba",
  "yobe",
  "zamfara"
];