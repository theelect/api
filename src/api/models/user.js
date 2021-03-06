import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import boom from 'boom';
import { pick } from 'lodash';
import jwt from 'jsonwebtoken';

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,    
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  phone: {
    type: String,
  },
  vin:  {
    type: String,
  },
  ward: {
    type: String,
  },
  lga: {
    String,
  },
  password: {
    type: String,
    required: true,
    minlenght: 6
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'viewer', 'wc'],
    default: 'viewer',
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  campaign: {
    type: String,
    required: true,
  },
  password_reset_code: {
      code: {
        type: String,
      },
      created: {
        type: Date,
        default: Date.now,
      },
    },
  tokens: [{
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    }],
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  },
);

userSchema.methods = {
  toJSON() {
    const userObject = this.toObject();
    return pick(userObject, [
      '_id', 'email', 'role', 'is_active', 'first_name', 'last_name',
      'phone', 'vin', 'ward', 'lga',
    ]);
  },

  generateAuthToken() {
    const user = this;
    const access = 'auth';
    const token = jwt
      .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
      .toString();
    user.tokens.push({ access, token });
    return user.save().then(() => token);
  },

  removeToken(token) {
    return this.updateOne({
      $pull: {
        tokens: { token },
      },
    });
  },
};

userSchema.statics = {
  findByToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const err = new Error('Invalid token');
      err.status = 401;
      return Promise.reject(err);
    }
    return this.findOne({
      _id: decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth',
    });
  },

  findByCredentials(email, password) {
    return this.findOne({ email }).then((user) => {
      if (!user) {
        const err = new Error('Email not found');
        err.status = 404;
        boom.boomify(err);
        return Promise.reject(err);
      }
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            const error = new Error('Incorrect password');
            error.status = 400;
            boom.boomify(error);
            reject(error);
          }
        });
      });
    });
  },
};

userSchema.pre('save', function preSave(next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

export default mongoose.model('User', userSchema);