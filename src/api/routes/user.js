import User from '../controllers/user';
import Auth from '../controllers/auth';

export default (app) => {
  
    /**
 * @api {get} /users Get all users
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeader {String} apiKey Campaign apiKey.
 * @apiPermission editor
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                  "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD" }
 * @apiSuccess {Array} Array of users
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [
 *   {
 *       "_id": "5beab16cc7b20d3783356937",
 *       "email": "new person",
 *       "role": "editor",
 *       "is_active": true
 *   },
 *   {
 *       "_id": "5beab3a096236137c4456c90",
 *       "email": "Second person",
 *       "role": "viewer",
 *       "is_active": true
 *   }
 *  ]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 500,
 *   "message": "Request failed."
 *  }
 */
  app.get('/api/v1/users', Auth.ensureAuthenticated, Auth.ensureCampaign, User.getAll);

      /**
 * @api {get} /user/:id/status Disable or Enable a user
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeader {String} apiKey Campaign apiKey.
 * @apiPermission editor
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                  "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD" }
 * @apiSuccess {String} _id ID of disabled user
 * @apiSuccess {String} username Username of disabled user
 * @apiSuccess {String} role Role of disabled user
 * @apiSuccess {String} is_active Status of disabled user
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       "_id": "5beab16cc7b20d3783356937",
 *       "email": "new person",
 *       "role": "admin",
 *       "is_active": false
 *   },
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 500,
 *   "message": "Request failed."
 *  }
 */
  app.post('/api/v1/user/:id/status', Auth.ensureAuthenticated, Auth.ensureCampaign, User.disableOrEnable);

       /**
 * @api {get} /user Get user by token
 * @apiGroup User
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g"}
 * @apiSuccess {String} _id ID of user
 * @apiSuccess {String} email Email of user
 * @apiSuccess {String} role Role of user
 * @apiSuccess {String} is_active Status of user
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *     _id": "5beeeda3971bbc4a6c699565",
 *      "email": "larry@admin.com",
 *      "role": "wc",
 *      "is_active": true,
 *      "phone": "08023738273",
 *      "vin": "22333333333",
 *      "ward": "that ward"
 *   },
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 500,
 *   "message": "Request failed."
 *  }
 */
  app.get('/api/v1/user', Auth.ensureAuthenticated, User.userByToken);
};