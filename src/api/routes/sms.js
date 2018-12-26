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
 * @apiParam {String} message Text message
 * @apiParam {Boolean} is_scheduled if message should be scheduled or sent immediately
 * @apiParam {String} schedule_date Date to schedule message in ISO format 2018-12-18T15:05:32.000Z
 * @apiParamExample {json} Input
 * {
 *	"message": "Testing sms sending",
 *	"is_scheduled": false,
 *	"schedule_date": "2018-12-18T15:05:32.000Z"
 * }
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
 *  @apiParam (Query string) {Boolean} is_scheduled optional filter by scheduled or not
 *  @apiSuccessExample {json} Success
 *
 *    HTTP/1.1 200 OK
 * [
 *   {
 *       "senders_name": "Tonye Cole",
 *       "_id": "5c0e31eea49302870f26e375",
 *       "status": "Sent",
 *       "is_scheduled": false
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

    /** *
 *  @api {patch} /sms/scheduled/:id Update a Scheduled sms. You can only change message or date of the scheduled sms
 *  @apiGroup SMS
 *  @apiSuccessExample {json} Success
 *
 *    HTTP/1.1 200 OK
 * {
 *   "to": [
 *       "+2347063226665"
 *   ],
 *   "from": "TonyeCole",
 *   "_id": "5c19200da8be1c8930a06427",
 *   "message": "Another one updated sms sending",
 *   "date": "2018-12-18T17:05:32.000Z",
 *   "createdAt": "2018-12-18T16:27:57.056Z",
 *   "updatedAt": "2018-12-18T16:27:57.056Z",
 *   "__v": 0
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.patch('/api/v1/sms/scheduled/:id', Auth.ensureAuthenticated, Auth.ensureCampaign, SMS.updateScheduledSMS);

      /**
 *  @api {delete} /sms/scheduled/:id Cancel a Scheduled sms
 *  @apiGroup SMS
 *  @apiSuccessExample {json} Success
 *
 *    HTTP/1.1 200 OK
 * {
 *   "message": "Scheduled sms has been canceled."
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.delete('/api/v1/sms/scheduled/:id', Auth.ensureAuthenticated, Auth.ensureCampaign, SMS.cancelScheduledSMS);

  /** 
 *  @api {get} /sms-stats Get total sent sms and sms sent for current month
 *  @apiGroup SMS
 *  @apiSuccessExample {json} Success
 *
 *    HTTP/1.1 200 OK
 * {
 *   "total_sent_sms": 24,
 *   "total_sent_this_month": 24,
 *   "total_scheduled_sms": 0
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.get('/api/v1/sms-stats', Auth.ensureAuthenticated, Auth.ensureCampaign, SMS.stats);
};