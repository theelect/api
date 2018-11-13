import Auth from '../controllers/auth';

export default (app) => {
    /**
 * @api {post} /login Login
 * @apiGroup Authentication
 * @apiParam {String} username User's username
 * @apiParam {String} password User's password
 * @apiParam {String} device User's device web or android only
 * @apiParamExample {json} Input
 * {
 *   "username": "admin",
 *   "password": "admin",
 *   "device": "web"
 * }
 * @apiSuccess {String} token Token to use for subsequent request
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhYjNhMDk2MjM2MTM3YzQ0NTZjOTAiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTA4MDY0fQ.HHRZzHvVlt1ROvhWjyz8T6tu4KSNZmKrEtHUAFL0IIQ",
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": "Device is required"
 *  }
 */
    app.post('/api/v1/login', Auth.login);

  /**
 * @api {post} /create-admin Create user account
 * @apiGroup Authentication
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeader {String} apiKey Campaign apiKey.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                  "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD" }
 * @apiParam {String} username User's username
 * @apiParam {String} password User's password
 * @apiParam {String} role User's role it can be viewer or editor only
 * @apiParamExample {json} Input
 * {
 *   "username": "admin",
 *   "password": "admin",
 *   "role": "editor"
 * }
 * @apiSuccess {Boolean} success
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *       success: true
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": "Username already exist"
 *  }
 */
    app.post('/api/v1/create-admin', Auth.ensureAuthenticated, Auth.ensureCampaign, Auth.createAdmin);


/**
 * @api {post} /logout Logout
 * @apiGroup Authentication
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g"}
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 OK
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 404,
 *   "message": "Username not found"
 *  }
 */
    app.delete('/api/v1/logout', Auth.ensureAuthenticated, Auth.logout);
};