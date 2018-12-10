import SMS from '../controllers/sms';
import Auth from '../controllers/auth';

export default (app) => {

        /**
 * @api {post} /sms Send sms. You can add query to filter the pvcs that will get the sms
 * @apiGroup SMS
 * * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiParam (Query string) {String} gender 
 * @apiParam (Query string) {String} profession If more than one, use comma separated string e.g profession=student,trader
 * @apiParam (Query string) {String} is_verified Send sms to only verified or not verified or both
 * @apiParam (Query string) {String} first_name 
 * @apiParam (Query string) {String} last_name
 * @apiParam (Query string) {String} phone 
 * @apiParam (Query string) {String} vin 
 * @apiParam (Query string) {String} campaign
 * @apiParam (Query string) {String} state_id
 * @apiParam (Query string) {String} state_name 
 * @apiParam (Query string) {String} lga Query by local government area. If more than one, use comma separated string e.g lga=ayamelum,ogbaru
 * @apiParam (Query string) {String} ward Query by ward. If more than one, use comma separated string e.g ward=ayamelum,ogbaru
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *   "SMSMessageData": {
 *       "Message": "Sent to 1/1 Total Cost: NGN 3.0000 Message parts: 1",
 *       "Recipients": [
 *           {
 *               "statusCode": 101,
 *               "number": "+2347063226665",
 *               "cost": "NGN 3.0000",
 *               "status": "Success",
 *               "messageId": "ATXid_446b85987d6cc85c4a464d62e48dc57a"
 *           }
 *       ]
 *   }
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.post('/api/v1/sms', Auth.ensureAuthenticated, Auth.ensureCampaign, SMS.sendSMS);
/** *
 *  @api {get} /sms Get Sent sms
 *  @apiGroup SMS
 *  @apiSuccessExample {json} Success
 *
 *    HTTP/1.1 200 OK
 * [
 *   {
 *       "senders_name": "Tonye Cole",
 *       "_id": "5c0e31eea49302870f26e375",
 *       "status": "Sent",
 *       "message": "Testing sms sending",
 *       "number_of_recipient": 1,
 *       "recipients": [
 *           {
 *               "_id": "5c0e31eea49302870f26e376",
 *               "statusCode": 101,
 *               "number": "+2347063226665",
 *               "cost": "NGN 3.0000",
 *               "status": "Success",
 *               "messageId": "ATXid_446b85987d6cc85c4a464d62e48dc57a"
 *           }
 *       ],
 *       "createdAt": "2018-12-10T09:29:18.101Z",
 *       "updatedAt": "2018-12-10T09:29:18.101Z",
 *       "__v": 0
 *   }
 * ]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.get('/api/v1/sms', Auth.ensureAuthenticated, Auth.ensureCampaign, SMS.getMessages);
};