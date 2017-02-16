#!/usr/bin/env node

var fh = require('fh-fhc');
var async = require('async');
var _ = require('underscore');
var lr = require('../index.js')();

/*
- Sets up fhc
- targets a cluster
- logs in
- creates a project
- deploys cloud app of project

*/
var id = Date.now().toString();
var project_id = 'testproject' + id;
var template_id = 'hello_world_project';
var environment_id = 'test';

async.waterfall([ function init (cb) {
  lr.actStart('fhc_load');
  fh.load({
    'loglevel': 'silly',
    'json': true,
    'inmemoryconfig': true
  }, function (err) {
    lr.actEnd('fhc_load');
    return cb(err);
  });
}, function target (cb) {
  lr.actStart('fhc_target');
  fh.target({_: ['https://testing.feedhenry.me']}, function (err) {
    lr.actEnd('fhc_target');
    return cb(err);
  });
}, function login (cb) {
  lr.actStart('fhc_login');
  fh.login({_: ['testing-admin@example.com', 'Password1']}, function (err, res) {
    lr.actEnd('fhc_login');
    return cb(err);
  });
}, function projectCreate (cb) {
  lr.actStart('fhc_project_create');
  fh.projects({_: ['create', project_id, template_id]}, function (err, project) {
    lr.actEnd('fhc_project_create');
    return cb(err, project);
  });
}, function appDeploy (project, cb) {
  lr.actStart('fhc_app_deploy');
  var app = _.findWhere(project.apps, {
    'type': 'cloud_nodejs'
  });
  fh.app.stage({
    'app': app.guid,
    'env': environment_id
  }, function (err) {
    lr.actEnd('fhc_app_deploy');
    return cb(err);
  });
}], function (err, results) {
  lr.checkError(err);
  lr.finish('ok');
});
