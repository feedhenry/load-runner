#!/usr/bin/env node

var lr = require('../../index.js')();
var async = require('async');
var request = require('request');
var args = require('yargs');
var crypto = require('crypto');
var fs = require('fs');

var params = args.options('a', {
  'alias': 'cloudappurl',
  'demand': true,
  'describe': 'Cloud App Url'
}).options('f', {
  'alias': 'formId',
  'demand': true,
  'describe': 'Form ID'
}).options('x', {
  'alias': 'textFieldId',
  'demand': true,
  'describe': 'Text Field ID'
}).options('y', {
  'alias': 'fileFieldId',
  'demand': true,
  'describe': 'File Field ID'
}).options('z', {
  'alias': 'filePath',
  'demand': false,
  'describe': 'Path To A File To Upload',
  'default': __dirname + '/fixtures/signature.png'
}).argv;

/**
 * A useful script for making a simple submission with a text and file field.
 */

//The URL Of A Running Cloud App
var SERVER = params.a;

//The Client App ID (Can be a random string)
var APP_ID = 'clientappid';

//The ID of a form associated with the Project containing the Cloud App Above
var FORM_ID = params.f;

//The ID Of The Text Field In The Form Above. Use `fhc appforms form get` command to get the details of the form
var TEXT_FIELD_ID = params.x;

//THE ID Of the file field in the form above. Use `fhc appforms form get` command to get the details of the form
var FILE_FIELD_ID = params.y;

//Path to the file to upload
var FILE_PATH = params.z;

async.waterfall([function(cb){
  //Creating a random string of characters for the file id
  crypto.randomBytes(32, function(ex, buf) {
    cb(null, buf.toString('hex'));
  });
}, function submitFormData(uid, cb) {

  //Metrics
  lr.actStart('submitFormData');

  var iso = new Date().toISOString();
  var now = Date.now();

  var options = {
    method: 'post',
    //Submission JSON Structure
    body: {
      _id: null,
      _type: 'submission',
      _ludid: FORM_ID + '_submission_' + now,
      appCloudName: '',
      formName: 'Claim your Container',
      formId: FORM_ID,
      deviceFormTimestamp: now,
      createDate: iso,
      appId: APP_ID,
      comments: [],
      timezoneOffset: 0,
      formFields: [
        { fieldId: TEXT_FIELD_ID, fieldValues: ['Load Runner']},
        { fieldId: FILE_FIELD_ID, fieldValues: [{
          fileName: 'signature.png',
          hashName: 'filePlaceHolder' + uid,
          contentType: 'binary',
          fileSize: 0,
          fileType: 'image/png',
          imgHeader: '',
          fileUpdateTime: now,
          fieldId: FILE_FIELD_ID }]
        }],
      saveDate: null,
      submitDate: iso,
      uploadStartDate: iso,
      submittedDate: null,
      userId: null,
      filesInSubmission: ['filePlaceHolder' + uid],
      deviceId: "03DC7AAA71A24ED195EB8A22F0B75E9F",
      status: 'inprogress',
      uploadTaskId: FORM_ID + '_submission_' + now + '_uploadTask'
    },
    json: true,
    url: SERVER + '/mbaas/forms/' + APP_ID + '/' + FORM_ID + '/submitFormData'
  };

  request(options, function(err, response, body){
    lr.actEnd('submitFormData');

    if(response.statusCode !== 200){
      return cb(body);
    }

    cb(err, uid, body);
  });
}, function submitFormFile(uid, submission, cb) {
  lr.actStart('submitFormFile');

  var options = {
    method: 'post',
    formData: {
      file: fs.createReadStream(FILE_PATH)
    },
    json: true,
    url: SERVER + '/mbaas/forms/' + APP_ID + '/' + submission.submissionId + '/' + FILE_FIELD_ID + '/filePlaceHolder' + uid + '/submitFormFile'
  };

  request.post(options, function(err, response, body){
    lr.actEnd('submitFormFile');
    cb(err, submission);
  });

}, function completeSubmission (submission, cb) {
  lr.actStart('completeSubmission');

  var options = {
    method: 'post',
    body: {
      submissionId: submission.submissionId
    },
    json: true,
    url: SERVER + '/mbaas/forms/' + APP_ID + '/' + submission.submissionId + '/completeSubmission'
  };

  request(options, function(err, response, body){
    lr.actEnd('completeSubmission');
    cb(err, submission);
  });
}, function claimContainer (submission, cb) {
  lr.actStart('claimContainer');

  var options = {
    method: 'get',
    url: SERVER + '/containers/' + submission.submissionId
  };

  request(options, function(err, response, body){
    lr.actEnd('claimContainer');
    cb(err, response);
  });
}], function(err, results) {
  if(err) { lr.checkError(err); }
  lr.finish("ok");
});
