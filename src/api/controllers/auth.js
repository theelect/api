import Joi from 'joi';
import boom from 'boom';
import User from '../models/user';
import Campaign from '../models/campaign';

const ensureCampaign = async (req, res, next) => {
  if (!req.header('apiKey')) {
    return res.status(401).send({ message: 'Include Campaign apiKey' });
  }

  try {
    const campaign = await Campaign.findOne({ apiKey: req.header('apiKey') });
    if(!campaign) {
      return res.status(400).send({ message: 'Invalid apiKey'});
    }

    req.campaign = campaign._id;
    return next();
  } catch(error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const ensureAuthenticated = async (req, res, next) => {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please Login' });
  }
  try {
    const token = req.header('Authorization').split(' ')[1];
    const user = await User.findByToken(token);
    if (!user) {
      throw boom.notFound('User with token not found. Login again')
    }
    if (!user.is_active) {
      throw boom.unauthorized('This account is disabled');
    }
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
  
};

const login = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      device: Joi.string().required(),
   });

  const { value, error } = Joi.validate(req.body, schema);
  if (error && error.details) {
    let message = 'Some required fields are missing';
    if (error.details[0]) {
      message = error.details[0].message
    }
    throw boom.badRequest(message);
  }
  
  const { email, password, device } = value;
  const user = await User.findByCredentials(email, password);
  if (!user.is_active) {
    throw boom.unauthorized('This account is disabled');
  }
  if (device === 'web' && user.role === 'viewer') {
    throw boom.unauthorized('You do not have permission on this platform');
  } 
  const token = await user.generateAuthToken();
  return res.status(200).json({token });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const createAdmin = async (req, res) => {
  try {
    if (req.user.role === "viewer") {
      throw boom.badRequest('You do not have the required permission to create new account.');
    }
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
    });

    const { value, error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      let message = 'Some required fields are missing';
      if (error.details[0]) {
        message = error.details[0].message
      }
      throw boom.badRequest(message);
    }

    const { email } = value;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw boom.badRequest('email already exist');
    }
    value.campaign = req.campaign;
    const user = new User(value);
    await user.save();
    const token = await user.generateAuthToken();
    return res.status(201).json({ success: true });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const logout = (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(204).send();
  }, () => {
    res.status(400).send();
  });
};

export default {
  ensureAuthenticated,
  login,
  createAdmin,
  logout,
  ensureCampaign,
};