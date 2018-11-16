import Auth from '../controllers/auth';

export default (app) => {
    /**
 * @api {post} /login Login
 * @apiGroup Authentication
 * @apiParam {String} email User's email
 * @apiParam {String} password User's password
 * @apiParam {String} device User's device web or android only
 * @apiParamExample {json} Input
 * {
 *   "email": "admin@admin.com",
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
 * @apiParam {String} email User's email
 * @apiParam {String} password User's password
 * @apiParam {String} role User's role it can be viewer or editor only
 * @apiParamExample {json} Input
 * {
 *   "email": "admin@admin.com",
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
 *   "message": "email already exist"
 *  }
 */
    app.post('/api/v1/create-admin', Auth.ensureAuthenticated, Auth.ensureCampaign, Auth.createAdmin);

  /**
 * @api {post} /create-wc Create ward coordinator
 * @apiGroup Authentication
 * @apiHeader {String} apiKey Campaign apiKey.
 * @apiHeaderExample {json} Request-Example:
                 { "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD" }
 * @apiParam {String} email User's email
 * @apiParam {String} password User's password
 * @apiParam {String} vin User's voters card vin
 * @apiParam {String} firstname User's first name
 * @apiParam {String} lastname User's last name
 * @apiParam {String} ward User's ward
 * @apiParam {String} lga User's local govt area
 * @apiParam {String} phone User's phone number
 * @apiParamExample {json} Input
 * {
 *   "email": "admin@admin.com",
 *   "password": "admin",
 *   "vin": "22333333333",
 *   "firstname": "Harry",
 *   "lastname": "Kane",
 *   "ward": "that ward",
 *   "lga": "lga",
 *   "phone": "08023738273"
 * }
 * @apiSuccess {String} email 
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhYjNhMDk2MjM2MTM3YzQ0NTZjOTAiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTA4MDY0fQ.HHRZzHvVlt1ROvhWjyz8T6tu4KSNZmKrEtHUAFL0IIQ"
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": "email already exist"
 *  }
 */
    app.post('/api/v1/create-wc', Auth.ensureCampaign, Auth.createWC);

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
 *   "message": "email not found"
 *  }
 */
app.delete('/api/v1/logout', Auth.ensureAuthenticated, Auth.logout);

/**
 * @api {post} /password-reset Request for Password Reset
 * @apiGroup Authentication
 * @apiParam {String} email User's email
 * @apiParamExample {json} Input
 * {
 *   "email": "admin@admin.com"
 * }
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *   "message": "Password reset link has been sent to ex@ex.com."
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 404
 *   "message": "Email not found."
 *  }
 */
app.post('/api/v1/request-password-reset', Auth.requestPasswordReset);


/**
 * @api {post} /update-password Update password
 * @apiGroup Authentication
 * @apiParam {String} code Password reset code sent to user
 * @apiParam {String} password New Password
 * @apiParamExample {json} Input
 * {
 *   "password": "adsnkmk",
 *   "code": 123421
 * }
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *  {
 *   "message": "Password reset link has been sent to ex@ex.com."
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 400
 *   "message": "Reset code expired."
 *  }
 */
app.post('/api/v1/internal/admin', Auth.internalCreateAdmin);

};