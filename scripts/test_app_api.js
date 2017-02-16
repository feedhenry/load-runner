#!/usr/bin/env node

var args = require('optimist');
var lr = require('../index.js')();
var login = require('../lib/login');
var hosts = require('../lib/appHosts');
var  request = require('request');
var util = require('util');
var fs = require('fs');

var params = args
.options('u', {
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
}).options('a', {
  'alias': 'app',
  'demand': process.env.app_guid === undefined,
  'describe': 'the environment to deploy the app to'
}).options('n', {
  'alias': 'endpoint',
  'demand': true,
  'describe': 'the api to call'
}).options('t', {
  'alias': 'times',
  'demand': true,
  'describe': 'number of calls to make'
}).argv;

const FH_DB_GET_ENDPOINT = '/fhdb/testkey';
const FH_DB_ENDPOINT = '/fhdb/';
const FH_CACHE_ENDPOINT = '/fhcache';
const FH_STATS_ENDPOINT = '/fhstats/countme/up';
const FH_HELLO_ENDPOINT = '/hello';

// var params = args.argv;
var times = params.t;
var api = params.endpoint;

if (process.env.app_guid) {
  params['a'] = process.env.app_guid;
  params['app'] = process.env.app_guid;
}

lr.actStart('fhc_login');

/**
 * This test
 * logs in
 * get the hosts for the specified apps
 * then makes the specified number of calls against the app endpoint. apis are
 *
 */

lr.actStart("fhc_login");
login(params.u, params.p, params.h)
  .then(() => {
    lr.actEnd('fhc_login');
    return params.a.split(',');
  })
  .then((apps) => {
    lr.actStart('fhc_app_hosts');
    return appHosts(apps, params.e);
  })
  .then((hosts) => {
    lr.actEnd('fhc_app_hosts');
    var calls;
    var file = util.format("%s_output.json", Date.now());
    if (api === 'fhdb') {
      calls = fhdb(hosts, times);
    } else if (api === 'fhcache') {
      calls = fhcache(hosts, times);
    } else if (api === 'hello') {
      calls = hello(hosts, times);
    } else if (api === 'fhstats') {
      calls = fhstats(hosts, times);
    }

    if (calls) {
      Promise.all(calls)
      .then((response)=> {
        console.log(lr.acts);

        fs.writeFileSync("./" + file,JSON.stringify(lr));
        lr.finish("ok")
      })
      .catch((err)=>{
        lr.checkError(err);
        lr.finish(1)
      });

    }
  })
  .catch((err) => {
    console.error('error executing test ');
    console.log(err);
    lr.checkError(err);
  });

function appHosts (apps, env) {
  return new Promise((resolve, reject) => {
    var resolvedHosts = apps.map((appid) => {
      return hosts(appid, env);
    });
    Promise.all(resolvedHosts)
      .then(resolve)
      .catch(reject);
  });
}

function call (hosts, endpoint, method, data, times) {
  var calls = [];
  hosts.map((host) => {
    var hostUrl = host.url + endpoint;
    for (var i=0; i < times; i++){
      calls.push(
        new Promise((resolve,reject)=>{
          var params = {"method":method,url:hostUrl};
          var act = util.format("request_time_%s_%s",api,i);
          if (data) params.json = data;

          lr.actStart(act);
          request(params,(err,res,body)=>{
            lr.actEnd(act);
            if (err){
              lr.actEnd(act);
              lr.checkError(err);
              return reject(err);
            }
            if (res.statusCode !== 200){
              err = {"error":"non 200 status code for  " + hostUrl + " method " + method, "status":res.statusCode};
              lr.actEnd(act);
              lr.checkError(err);
              return reject(err);
            }

            return resolve(body);
          });
        })
      );
    }
  });
  return calls;
}

function hello (hosts, times) {
  return call(hosts, FH_HELLO_ENDPOINT, 'GET', undefined, times);
}

function fhdb(hosts,times){
  lr.actStart("fhdb");
  var createData = {"text":"this is a document"};
  var creates = call(hosts,FH_DB_ENDPOINT,"POST",createData,times);
  //var lists = call(hosts,FH_DB_ENDPOINT,"GET",undefined,times);
  //
  //for (var i=0; i < lists.length; i++){
  //  creates.push(lists[i]);
  //}
  return creates;
}

function fhcache (hosts, times) {
  var createData = {'key': 'test', 'value': 'some test cache value'};
  var creates = call(hosts, FH_CACHE_ENDPOINT, 'POST', createData, times);
  var lists = call(hosts, FH_DB_GET_ENDPOINT + '/test', 'GET', undefined, times);

  for (var i = 0; i < lists.length; i++) {
    creates.push(lists[i]);
  }
  return creates;
}

// note there currently seem to be issues with fh-stats
function fhstats (hosts, times) {
  var lists = call(hosts, FH_STATS_ENDPOINT, 'GET', undefined, times);
  return lists;
}
