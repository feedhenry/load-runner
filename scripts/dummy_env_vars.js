#!/usr/bin/env node
`use strict`;

/**
 Dummy test to show use of environment variables. It simulates simulate random delay based on the value.
 */
const lr = require('../index.js')();
const args = require('yargs');
const async = require('async');

async.waterfall([function(cb) {
  lr.actStart('RANDOM DELAY');
  // no actual code, just mock async thing happening
  setTimeout(function() {
    lr.actEnd('RANDOM DELAY');
    return cb();
  }, parseFloat(process.env.LR_RAND) * 100);
}], function(err, results) {
  if (err) {
    return lr.finish('failed');
  }
  lr.finish('ok');
});
