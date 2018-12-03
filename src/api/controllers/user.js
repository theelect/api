import boom from 'boom';
import Joi from 'joi';
import User from '../models/user';

const userByToken = async (req, res) => {
  res.status(200).json(req.user);
}

const getAll = async (req, res) => {
  try {
    if (req.user.role === 'viewer' || req.user.role === 'wc') {
      throw boom.unauthorized('You do not have right permission.');
    }
    const users = await User.find({ campaign: req.campaign, role: { $ne: 'super-admin' } });
    res.status(200).json(users);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndUpdate({ '_id': id }, { $set: req.body }, { new: true });
    if (!user)
      return res.status(404).send({ message: 'User not found' }); 
    res.status(200).json(user);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const userById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw boom.notFound('User not found');
    }
    res.status(200).json(user);
  } catch(error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
}

const disableOrEnable = async (req, res) => {
  const { id } = req.params;
  const schema = Joi.object().keys({
    is_active: Joi.boolean().required(),
   });

  const { value, error } = Joi.validate(req.body, schema);
  if (error && error.details) {
    let message = 'Some required fields are missing';
    if (error.details[0]) {
      message = error.details[0].message
    }
    throw boom.badRequest(message);
  }
  const {is_active} = value;
  try {
    if (req.user.role === 'wc' || req.user.role === 'viewer') {
      throw boom.unauthorized('You do not have permission to disable a user account.');
    }
    const user = await User.findOneAndUpdate({ '_id':id, 'campaign': req.campaign }, { $set: { is_active } }, { new: true });
    if (!user) {
      throw boom.notFound('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    boom.boomify(error);
    const err = new Error();
    err.status = error.status || error.output.statusCode || 500;
    err.message = error.message || 'Internal server error';
    res.status(err.status).send(err);
  }
};

export default {
  getAll,
  disableOrEnable,
  userByToken,
  userById,
  update
};