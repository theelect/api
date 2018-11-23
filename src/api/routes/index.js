import Auth from './auth';
import Campaign from './campaign';
import User from './user';
import PVC from './pvc';
import LGA from './lga';

export default (app) => {
  Auth(app);
  Campaign(app);
  User(app);
  PVC(app);
  LGA(app);
  app.get('/healthcheck', (req, res) => {
    res.json({ message: 'Working' });
  });
};
