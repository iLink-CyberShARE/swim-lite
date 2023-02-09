export const environment = {
  production: true,
  baseurl: 'http://localhost:8081',
  nodeServer: 'http://localhost:9110',
  GAMSEndpoint: '', // not included in swim-lite
  ScilabEndpoint: '', // not included in swim-lite
  RecommenderEndpoint: '', // not included in swim-lite
  PythonEndpoint: 'http://localhost:5030/swim-wb-py/model/run',
  NLNGWebservice: '',

  // Service Health Endpoints
  ScilabHealth: '', // not included in swim-lite
  GAMSHealth: '', // not included in swim-lite
  PythonHealth : 'http://localhost:5030/swim-wb-py/service/ping',

  // SWIM-HS endpoints
  SWIMHS: '', // not included in swim-lite
  HS_API: 'https://www.hydroshare.org/hsapi',
  HS_API2: 'https://www.hydroshare.org/hsapi2',

};
