import PVC from '../controllers/pvc';
import Auth from '../controllers/auth';

export default (app) => {
      /**
 * @api {post} /pvc/verifyViaApp Verify PVC via app
 * @apiGroup PVC
 * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiParam {String} state_id ID of state RIVERS is 33
 * @apiParam {String} vin PVC vin 
 * @apiParam {String} phone PVC owner phone number
 * @apiParam {String} last_name PVC owner last name
 * @apiParamExample {json} Input
 * {
 *   "state_id": "4",
 *   "phone": "07083838392",
 *   "last_name": "Okonkwo",
 *   "vin": "962193"
 * }
 * @apiSuccess (PVC) {Boolean} is_verified Indicating if PVC was successfully verified
 * @apiSuccess (PVC) {String} verification_error Error message why PVC failed verification
 * @apiSuccess (PVC) {String} campaign Campagin ID of team that uploaded PVC
 * @apiSuccess (PVC) {String} submitted_by Id of wc that collected PVC
 * @apiSuccess (PVC) {String} _id Id of PVC
 * @apiSuccess (PVC) {String} state_id State of PVC
 * @apiSuccess (PVC) {String} vin Vin number of PVC
 * @apiSuccess (PVC) {String} phone PVC owner phone number
 * @apiSuccess (PVC) {String} last_name PVC owner last name
 * @apiSuccess (PVC) {Object} voter_info Object of PVC info received from inec verification api
 * @apiSuccess (VOTER_INFO) {Object} voter_info.Voter Informations about the voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.id Id of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.vin Vin of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.pu_id PU_ID of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.delimitation No idea what this is
 * @apiSuccess (VOTER) {String} voter_info.Voter.state_id state id of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.last_name last name of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.first_name first name of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.other_names Other names of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.gender Voter gender
 * @apiSuccess (VOTER) {String} voter_info.Voter.id occupation Voter's occupation
 * @apiSuccess (VOTER) {String} voter_info.Voter.int_created Date PVC was register (guessing)
 * @apiSuccess (VOTER_INFO) {Object} voter_info.State  State Informations about the voter
 * @apiSuccess (STATE) {String} voter_info.State.id Id of voter's state
 * @apiSuccess (STATE) {String} voter_info.State.name name of voter's state
 * @apiSuccess (STATE) {String} voter_info.State.abbreviation Abbreviation of voter's state number (guessing)
 * @apiSuccess (VOTER_INFO) {Object} voter_info.Pu  Polling Unit Informations about the voter
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.pu polling unit name
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.ward polling unit ward
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.lga polling unit local government area
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.state polling unit State
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.delim polling unit delimitation
 * @apiSuccess (PVC) {String} createdAt Date we created pvc in our DB
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *    "geo": {
                "type": "Point",
                "coordinates": [
                    6.43,
                    4.33
                ]
            },
            "is_verified": true,
            "verification_error": null,
            "campaign": "5beaadf9d421bd36bfa6a547",
            "submitted_by": "5beec36638dc2e3f2b09bb7a",
            "_id": "5bffe189be9c13bc87438004",
            "state": "Anambra",
            "phone": "03839373830108",
            "last_name": "Okonkwo",
            "first_name": "Oduma",
            "vin": "962133",
            "lga": "okau",
            "latitude": 4.33,
            "longitude": 6.43,
            "gender": "male",
            "profession": "teacher",
            "createdAt": "2018-11-29T12:54:33.247Z",
            "updatedAt": "2018-11-29T12:54:33.247Z",
            "__v": 0
 *  }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": "Device is required"
 *  }
 */
  app.post('/api/v1/pvc/verifyViaApp', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.verifyViaApp);


        /**
 * @api {get} /pvc Verify Get all PVC. You can add query to filter content
 * @apiGroup PVC
 * * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiParam (Query string) {String} page Page number of query
 * @apiParam (Query string) {String} perPage limit of result in each page. Default is 10
 * @apiParam (Query string) {String} gender 
 * @apiParam (Query string) {String} occupation
 * @apiParam (Query string) {String} is_verified Query verified or not verified
 * @apiParam (Query string) {String} submitted_by query PVC submitted by a WC using WC id
 * @apiParam (Query string) {String} first_name 
 * @apiParam (Query string) {String} last_name
 * @apiParam (Query string) {String} phone
 * @apiParam (Query string) {String} vin 
 * @apiParam (Query string) {String} campaign
 * @apiParam (Query string) {String} state_id
 * @apiParam (Query string) {String} state_name 
 * @apiParam (Query string) {String} lga Query by local government area. If more than one, use comma separated string e.g lga=ayamelum,ogbaru
 * @apiParam (Query string) {String} ward Query by ward. If more than one, use comma separated string e.g ward=ayamelum,ogbaru
 * @apiParam (Query string) {String} entry_start_date Query date range (start date) based on Date PVC was saved on our DB
 * @apiParam (Query string) {String} entry_end_date Query date range (end date) based on Date PVC was saved on our DB
 * @apiParam (Query string) {String} pvc_registration_start_date Query based on date (start date for a range) pvc was registered
 * @apiParam (Query string) {String} pvc_registration_end_date Query based on date (end date for a range) pvc was registered
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *   "total": 1,
 *   "limit": 10,
 *   "page": 1,
 *   "pages": 1
 *   "doc": [
 *    {
 *      "geo": {
                "type": "Point",
                "coordinates": [
                    6.43,
                    4.33
                ]
            },
            "is_verified": true,
            "verification_error": null,
            "campaign": "5beaadf9d421bd36bfa6a547",
            "submitted_by": "5beec36638dc2e3f2b09bb7a",
            "_id": "5bffe189be9c13bc87438004",
            "state": "Anambra",
            "phone": "03839373830108",
            "last_name": "Okonkwo",
            "first_name": "Oduma",
            "vin": "962133",
            "lga": "okau",
            "latitude": 4.33,
            "longitude": 6.43,
            "gender": "male",
            "profession": "teacher",
            "createdAt": "2018-11-29T12:54:33.247Z",
            "updatedAt": "2018-11-29T12:54:33.247Z",
            "__v": 0
 *    }
 *   ]
 *  }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.get('/api/v1/pvc', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.getAll);


        /**
 * @api {get} /pvc/statistics?type=occupation Get pvc grouped by a field with count and percentage
 * @apiGroup PVC
 * * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiParam {String} type Field to group by. type can be gender, occupation, lga or ward. Defaults to lga if no type 
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *   [
 *      {
 *       "_id": "business",
 *       "count": 1,
 *       "percentage": 50
 *   },
 *   {
 *       "_id": "farming/fishing",
 *       "count": 1,
 *       "percentage": 50
 *   }
 *    ]
 *  }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
app.get('/api/v1/pvc/statistics', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.statistics);

 /**
 * @api {get} /pvc/occupation Get list of occupations in collected pvc
 * @apiGroup PVC
 * * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   [
 *    "business",
 *     "farming/fishing"
 *    ]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
app.get('/api/v1/pvc/occupation', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.occupation);

 app.get('/api/v1/contacts', PVC.smsAPIGet);
 app.post('/api/v1/pvc/create', PVC.create);
 app.get('/api/v1/pvc-count', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.count);
 app.post('/api/v1/pvc/verify_by_sms', PVC.verify_via_sms);
 app.get('/api/v1/pvc/age_statistics', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.age_statistics);
 app.get('/api/v1/pvc/count/gender_lga', PVC.lgaAndGenderCount);
   /**
 * @api {get} /pvc/:id Get PVC by id
 * @apiGroup PVC
 * * @apiHeader {String} Authorization Users unique token.
 * @apiHeaderExample {json} Request-Example:
                 { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmVhOTk3NjY4YjM3OTMyYWExNDEzODUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMTAxMzY3fQ.090xmsDngmmn_G5EJbNLi6O3I3D_5h30BEiwjldxH7g",
                "apiKey": "i871KgLg8Xm6FRKHGWCdBpaDHGEGjDJD"}
 * @apiParam {String} id ID of PVC
 * @apiSuccess (PVC) {Boolean} is_verified Indicating if PVC was successfully verified
 * @apiSuccess (PVC) {String} verification_error Error message why PVC failed verification
 * @apiSuccess (PVC) {String} campaign Campagin ID of team that uploaded PVC
 * @apiSuccess (PVC) {String} submitted_by Id of wc that collected PVC
 * @apiSuccess (PVC) {String} _id Id of PVC
 * @apiSuccess (PVC) {String} state_id State of PVC
 * @apiSuccess (PVC) {String} vin Vin number of PVC
 * @apiSuccess (PVC) {String} phone PVC owner phone number
 * @apiSuccess (PVC) {String} last_name PVC owner last name
 * @apiSuccess (PVC) {Object} voter_info Object of PVC info received from inec verification api
 * @apiSuccess (VOTER_INFO) {Object} voter_info.Voter Informations about the voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.id Id of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.vin Vin of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.pu_id PU_ID of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.delimitation No idea what this is
 * @apiSuccess (VOTER) {String} voter_info.Voter.state_id state id of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.last_name last name of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.first_name first name of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.other_names Other names of voter
 * @apiSuccess (VOTER) {String} voter_info.Voter.gender Voter gender
 * @apiSuccess (VOTER) {String} voter_info.Voter.id occupation Voter's occupation
 * @apiSuccess (VOTER) {String} voter_info.Voter.int_created Date PVC was register (guessing)
 * @apiSuccess (VOTER_INFO) {Object} voter_info.State  State Informations about the voter
 * @apiSuccess (STATE) {String} voter_info.State.id Id of voter's state
 * @apiSuccess (STATE) {String} voter_info.State.name name of voter's state
 * @apiSuccess (STATE) {String} voter_info.State.abbreviation Abbreviation of voter's state number (guessing)
 * @apiSuccess (VOTER_INFO) {Object} voter_info.Pu  Polling Unit Informations about the voter
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.pu polling unit name
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.ward polling unit ward
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.lga polling unit local government area
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.state polling unit State
 * @apiSuccess (POLLING UNIT) {String} voter_info.Pu.delim polling unit delimitation
 * @apiSuccess (PVC) {String} createdAt Date we created pvc in our DB
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 * "geo": {
                "type": "Point",
                "coordinates": [
                    6.43,
                    4.33
                ]
            },
            "is_verified": true,
            "verification_error": null,
            "campaign": "5beaadf9d421bd36bfa6a547",
            "submitted_by": "5beec36638dc2e3f2b09bb7a",
            "_id": "5bffe189be9c13bc87438004",
            "state": "Anambra",
            "phone": "03839373830108",
            "last_name": "Okonkwo",
            "first_name": "Oduma",
            "vin": "962133",
            "lga": "okau",
            "latitude": 4.33,
            "longitude": 6.43,
            "gender": "male",
            "profession": "teacher",
            "createdAt": "2018-11-29T12:54:33.247Z",
            "updatedAt": "2018-11-29T12:54:33.247Z",
            "__v": 0
 * }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Bad Request
 * {
 *   "status": 404,
 *   "message": "PVC not found"
 *  }
 */
  app.get('/api/v1/pvc/:id', Auth.ensureAuthenticated, Auth.ensureCampaign, PVC.get);
};