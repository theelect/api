import Auth from './auth';
import Campaign from './campaign';
import User from './user';

export default (app) => {
  Auth(app);
  Campaign(app);
  User(app);
  app.get('/healthcheck', (req, res) => {
    res.json({ message: 'Working' });
  });
};
