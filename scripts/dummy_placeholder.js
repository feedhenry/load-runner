#!/usr/bin/env node
`use strict`;

/**
 Dummy test to show placeholder {rand}. It simulates simulate random delay based on the value.
 */
const lr = require('../index.js')();
const args = require('yargs');
const async = require('async');

args.options('r', {
  'alias': 'random',
  'demand': true,
  'describe': 'Random value between 0-1'
});

const params = args.argv;

async.waterfall([function(cb) {
  lr.actStart('RANDOM DELAY');
  // no actual code, just mock async thing happening
  setTimeout(function() {
    lr.actEnd('RANDOM DELAY');
    return cb();
  }, parseFloat(params.r) * 100);
}], function(err, results) {
  if (err) {
    return lr.finish('failed');
  }
  lr.finish('ok');
});
