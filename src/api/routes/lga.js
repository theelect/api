import LGA from '../controllers/lga';

export default (app) => {

/**
 * @api {get} /lgas Get list of LGA and wards
 * @apiGroup LGA
 * @apiParam (Query string) {String} state_id Filter by state_id
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *  [
 *   {
 *       "wards": [
 *           "abuloma-amadi ama",
 *           "Diobu",
 *           "Elekahia",
 *           "Mgbundukwu 1",
 *           "Mgbundukwu 2",
 *           "Nkpolu Oroworukwo 1",
 *           "Nkpolu Oroworukwo 2",
 *           "Ochiri-Rumukalagbor",
 *           "Ogbunabali",
 *           "Oroabali"
 *       ],
 *       "_id": "5bf79b8268f55c5daa7148dc",
 *       "name": "port-harcourt",
 *       "state_id": "33",
 *       "createdAt": "2018-11-23T06:17:38.842Z",
 *       "updatedAt": "2018-11-23T06:17:38.842Z",
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
  app.get('/api/v1/lgas', LGA.getAll);


  app.post('/api/v1/lga', LGA.create);

  /**
 * @api {get} /lga/map Get map data
 * @apiGroup LGA
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * [
 *   [
 *       "NG033015",
 *       "98"
 *   ],
 *   [
 *       "NG033016",
 *       "7"
 *   ],
 *   [
 *       "NG033008",
 *       "10"
 *   ],
 *   [
 *       "NG033022",
 *       "3"
 *   ],
 *   [
 *       "NG033002",
 *       "5"
 *   ],
 *   [
 *       "NG033005",
 *       "1"
 *   ],
 *   [
 *       "NG033004",
 *       "1"
 *   ]
 * ]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Bad Request
 * {
 *   "status": 500,
 *   "message": "Internal server error"
 *  }
 */
  app.get('/api/v1/lga/map', LGA.mapData);
};