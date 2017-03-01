#!/usr/bin/env node
`use strict`;

/**
 Dummy test to show use of environment variables. It simulates simulate random delay based on the value.
 */
const lr = require('../index.js')();
const args = require('yargs');
const async = require('async');

async.waterfall([function(cb) {
  const flowNumber = process.env.LR_FLOW_NUMBER;
  lr.actStart(`FLOW ${flowNumber}`);
  // no actual code, just mock async thing happening
  setTimeout(function() {
    lr.actEnd(`FLOW ${flowNumber}`);
    return cb();
  }, (flowNumber + 2) * 10);
}], function(err, results) {
  if (err) {
    return lr.finish('failed');
  }
  lr.finish('ok');
});
