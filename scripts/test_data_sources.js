#!/usr/bin/env node

var args = require('yargs');
var lr = require('../index.js')();
var login = require('../lib/login');
var createDataSource = require('../lib/createDataSource');

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
}).options('s', {
  'alias': 'service',
  'demand': true,
  'describe': 'Guid of data source service'
}).options('e', {
  'alias': 'endpoint',
  'demand': true,
  'describe': 'Service endpoint'
}).options('r', {
  'alias': 'refresh',
  'demand': true,
  'describe': 'Refresh interval'
}).options('l', {
  'alias': 'logEntries',
  'demand': true,
  'describe': 'Number of log entries'
});

var params = args.argv;
var dsName = function () {
  return 'loadrunner' + Math.floor(Math.random() * 100000) + 1;
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
    return createDataSource({
      title: dsName(),
      service: params.s,
      path: params.e,
      refresh: params.r,
      desc: 'description',
      logEntries: params.l
    });
  })
  .then((data) => {
    console.log({message: 'stage completed' + JSON.stringify(data)});
    lr.actEnd('fhc_project_create');
  })
  .catch(err => {
    console.log('there was an error with the test ', err);
    lr.checkError(err);
  });
