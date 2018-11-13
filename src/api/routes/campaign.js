import Campaign from '../controllers/campaign';
import Auth from '../controllers/auth';

export default (app) => {
  app.post('/api/v1/campaign', Campaign.create);
  app.get('/api/v1/campaign', Auth.ensureAuthenticated, Campaign.getAll);
};