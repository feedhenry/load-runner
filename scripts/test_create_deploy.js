#!/usr/bin/env node

var args = require('optimist');
var lr = require('../index.js')();
var login = require('../lib/login');
var createProject = require('../lib/createProject');
var createApp = require('../lib/createApp');
var deployApp = require('../lib/deployApp');

args.options('u', {
  'alias': 'username',
  'demand': true,
  'describe': 'Username'
}).options('p', {
  'alias': 'password',
  'demand': true,
  'describe': 'Password'
}).options('h', {
  'alias': 'host',
  'demand': true,
  'describe': 'Host to login to e.g. https://testing.feedhenry.me'
}).options('e', {
  'alias': 'environment',
  'demand': true,
  'describe': 'the environment to deploy the app to'
}).options('g', {
  'alias': 'git repo url',
  'demand': true,
  'describe': 'the git repo for the app to import from'
});

var params = args.argv;
var projectName = function () {
  return 'loadrunner' + Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
};
lr.actStart('fhc_login');
login(params.u, params.p, params.h)
  .then(() => {
    console.log({message: 'login completed'});
    lr.actEnd('fhc_login');
  })
  .then(() => {
    lr.actStart('fhc_project_create');
    console.log({message: 'creating project'});
  })
  .then(() => {
    return createProject(projectName());
  })
  .then((project) => {
    lr.actEnd('fhc_project_create');
    lr.actStart('fhc_app_import');
    console.log({message: 'created project ' + project.title + project.guid + ' importing app for load test'});
    return createApp.createCloudAppInProject(project.guid, params.g);
  })
  .then((app) => {
    lr.actEnd('fhc_app_import');
    lr.actStart('fhc_app_deploy');
    console.log({message: 'app created ' + app.title + app.guid + ' Staging app ' + app.title + ' to  env ' + params.e});
    return deployApp(app.guid, params.e);
  })
  .then((data) => {
    console.log({message: 'stage completed' + JSON.stringify(data)});
    lr.actEnd('fhc_app_deploy');
    return lr.finish('ok');
  })
  .catch(err => {
    console.log('there was an error with the test ', err);
    lr.checkError(err);
    return lr.finish('failed');
  });
