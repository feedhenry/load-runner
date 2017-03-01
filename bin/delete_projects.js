#!/usr/bin/env node

// NOTE: this will delete all the projects in the target cluster, use this wisely!!!

var fh = require('fh-fhc');
var async = require('async');

async.waterfall([ function init(cb) {
  fh.load({
    'loglevel': 'silly',
    'json': true,
    'inmemoryconfig': true
  }, function(err) {
    return cb(err);
  });
}, function target(cb) {
  fh.target({_: ['http://mydomain.example.com/']}, function(err) {
    return cb(err);
  });
}, function login(cb) {
  fh.login({_: ['testing-admin@example.com', 'PutAPasswordHere']}, cb);
}, function projectCreate(cb) {
  fh.projects({_: ['list']}, function(err, projects) {
    return cb(err, projects);
  });
}, function deleteProjects(projects, cb) {
  async.eachSeries(projects, function(project, deleteErr) {
    console.log('deleting project with guid ' + project.guid + ' : ' + project.title);
    fh.projects({_: ['delete', project.guid]}, deleteErr);
  }, cb);
}], function(err, results) {
  console.log(err, results);
});
