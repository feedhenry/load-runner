var login = require('../lib/login');
var createProject = require('../lib/createProject');
var createApp = require('../lib/createApp');
var deployApp = require('../lib/deployApp');

module.exports = function createAndDeployApp (params) {
  return login(params.u, params.p, params.h)
    .then(() => {
      console.log({message: 'login completed'});
      console.log({message: 'creating project'});
      return createProject(params.projectName);
    })
    .then((project) => {
      console.log({message: 'created project ' + project.title + project.guid + ' importing app for load test'});
      return createApp.createCloudAppInProject(project.guid, params.g);
    })
    .then((app) => {
      console.log({message: 'app created ' + app.title + app.guid + ' Staging app ' + app.title + ' to  env ' + params.e});
      process.env.app_guid = app.guid;
      return deployApp(app.guid, params.e);
    })
    .then((data) => {
      console.log({message: 'stage completed' + JSON.stringify(data)});
    })
    .catch(err => {
      console.log('there was an error with the test ', err);
    });
};
