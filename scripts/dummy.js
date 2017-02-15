#!/usr/bin/env node

var lr = require('../index.js')();
var async = require('async');

/*
Dummy test does 3 async actions taking 200, 400 & 800 milliseconds, in that order
*/

async.waterfall([ function mockFirstAction (cb) {
  lr.actStart('FIRST');
  // no actual code, just mock async thing happening
  setTimeout(function () {
    lr.actEnd('FIRST');
    return cb();
  }, 200);
}, function mockSecondAction (cb) {
  lr.actStart('SECOND');
  // no actual code, just mock async thing happening
  setTimeout(function () {
    lr.actEnd('SECOND');
    return cb();
  }, 400);
}, function mockFinalAction (cb) {
  lr.actStart('FINAL');
  // no actual code, just mock async thing happening
  setTimeout(function () {
    lr.actEnd('FINAL');
    return cb();
  }, 800);
}], function (err, results) {
  if (err) {
    return lr.finish('failed');
  }
  lr.finish('ok');
});
