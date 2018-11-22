import Joi from 'joi';
import boom from 'boom';
import User from '../models/user';
import Campaign from '../models/campaign';

const generateCellphoneCode = () => {
  const leftNumber = Math.floor(Math.random() * 900) + 100;
  const rightNumber = Math.floor(Math.random() * 900) + 100;
  return `${leftNumber}${rightNumber}`;
};

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
  if (device === 'web' && (user.role === "viewer" || user.role === 'wc')) {
    throw boom.unauthorized('You do not have permission on this platform');
  } 
  const token = await user.generateAuthToken();
  return res.status(200).json({ token });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};
//'agent-2','wc'
const createAdmin = async (req, res) => {
  try {
    if (req.user.role === "viewer" || req.user.role === 'wc') {
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
    return res.status(201).json({ success: true });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const internalCreateAdmin = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
      campaign: Joi.string().required(),
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
    const user = new User(value);
    await user.save();
    return res.status(201).json({ success: true });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const logout = (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(204).send();
  }, () => {
    res.status(400).send();
  });
};

const requestPasswordReset = async (req, res) => {
  const code = generateCellphoneCode();
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate({ 'email': email }, { $set: { 'password_reset_code': { 'code': code } } }, { new: true });
    if (!user) {
      throw boom.notFound('Email not found');
    }
    const emailBody = `Hi!\n 
        Here is your password reset code.\n 
        ${code}`;
    const data = {
      from: 'noreply@theelect.com',
      to: email,
      subject: '[TheElect] Password Reset',
      text: emailBody,
    };
    Mail.sendSimpleMail(data);
    res.status(200).send({ message: `Password reset link has been sent to ${email}.` });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const updatePassword = async (req, res) => {
  const { password, code } = req.body;
  try {
    const user = await User.findOne({ 'password_reset_code.code': code  });
    const expiryDate = moment(user.password_reset_code.created).add(5, 'm');
    if (moment(expiryDate).isBefore(new Date())) {
      throw boom.badRequest('Reset code expired.');
    }
    user.password = password;
    await user.save();
    res.status(200).send({ message: 'Password updated.' });
  } catch (err) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const createWC = async (req, res) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      phone: Joi.string().required(),
      vin: Joi.string().required(),
      ward: Joi.string().required(),
      lga: Joi.string().required(),
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
    user.role = 'wc';
    await user.save();
    const token = await user.generateAuthToken();
    return res.status(201).json({ token });
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

export default {
  ensureAuthenticated,
  login,
  createAdmin,
  logout,
  ensureCampaign,
  updatePassword,
  requestPasswordReset,
  createWC,
  internalCreateAdmin,
};