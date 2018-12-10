import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import Routes from './api/routes';
import Helpers from './api/controllers/helpers';

require('dotenv').config();

// create express app
const app = express();

// Http request logger
app.use(
	logger('dev', {
		skip: () => app.get('env') === 'test',
	}),
);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use(cors());

app.use(express.static("src/public"));

app.use((err, req, res, next) => {
  if (err.isServer) {
    // log the error...
    // probably you don't want to log unauthorized access
    // or do you?
  }
  return res.status(err.output.statusCode).json(err.output.payload);
})

// Configuring the database
mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
	.connect(
		process.env.MONGODB_URI,
		{ useNewUrlParser: true },
	)
	.then(() => {
		console.log('Successfully connected to the database');
	})
	.catch(err => {
		console.log('Could not connect to the database. Exiting now...', err);
		process.exit();
	});

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to Elect application.' });
});


Routes(app);

// Helpers.updateLGA();

export default app;
