#!/usr/bin/env node

/*
 This script allows to run series of tests with different configs/profiles:
 Profiles define argument flags for load-runner.js and test script.
 */

const async = require('async'),
      _ = require('underscore'),
      path = require('path');


var args = require('yargs')
  .usage('NOTE: To pass any commands onto the script being executed, finish with a -- followed by any arguments to the passed')
  .options('p', {
    'alias': 'profiles',
    'demand': true,
    'describe': 'Profiles that will be used to run load-runner, should be path within profiles directory e.g. -p profiles/submissions/example'
  })
  .options('b', {
    'alias': 'before',
    'demand': false,
    'describe': 'Library to execute before the start of tests'
  })
  .options('o', {
    'alias': 'output',
    'default': 'true',
    'describe': 'Whether or not to save logs, individual test script output and reports' +
    '\nSave destination will be:' +
    '\nruns/run_<script>_<timestamp>_<numUsers>_<concurrency>_<rampUp>/' +
    '\ne.g. runs/run_test.js_1329317523630_100_10_5/'
  }).wrap(100).argv;

const profile_conf_path = path.resolve(process.cwd(), args.p);
const profile_conf = require(profile_conf_path);
var spawn = require('child_process').exec;

// queue worker
var q = async.queue(function profile_task(task, callback) {
  // arguments passed to load-runner and test script
  const args_str = ' -c ' + task.profile.concurency +
              ' -n ' + task.profile.numUsers +
              ' -r ' + task.profile.rampUp +
              ' -s ' + path.resolve(process.cwd(), profile_conf.script) +
              ' -o ' + args.o +
              ' -p ' + task.profile.name +
              ' -- ' + task.profile.script_args;

  spawn('node ./bin/load-runner.js' + args_str,
    {cwd: process.cwd()}, //we want to start at root of the project
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        callback();
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        callback()
      }
    });
});

// push tasks to the queue, pass in profile for correct args build
profile_conf.profiles.forEach(function(profile) {
  q.push({profile: profile}, function(err) {
    console.log('finished processing ' + profile.name);
    if (err) {
      console.log(err);
    }
  });
});



