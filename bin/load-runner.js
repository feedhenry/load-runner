#!/usr/bin/env node

/*

Load Runner

Name based on the great classic game - Lode Runner
 -Article: http://en.wikipedia.org/wiki/Lode_Runner
 -Online Game: http://www.classiconlinegames.nl/nintendo/174-loderunner

*/

var loop = require('nodeload/lib/loop');
var runs = 0;
var spawn = require('child_process').spawn;
var stats = require('nodeload/lib/stats');
var fs = require('fs');
var util = require('util');
var open = require('open');
var setup_scripts = require('../setup/index.js');

var args = require('optimist')
  .usage('NOTE: To pass any commands onto the script being executed, finish with a -- followed by any arguments to the passed. You can also pass a placeholder `{runNum}` to pass in the current test run number.')
  .options('c', {
    'alias': 'concurrency',
    'default': 1,
    'describe': 'Concurrency of Users'
  })
  .options('n', {
    'alias': 'numUsers',
    'default': 1,
    'describe': 'Number of Users'
  })
  .options('r', {
    'alias': 'rampUp',
    'default': 1,
    'describe': 'Ramp up time to Concurrency of Users (in seconds)'
  })
  .options('b', {
    'alias': 'before',
    'demand': false,
    'describe': 'Library to execute before the start of tests'
  })
  .options('s', {
    'alias': 'script',
    'demand': true,
    'describe': 'Script to execute'
  })
  .options('o', {
    'alias': 'output',
    'default': 'false',
    'describe': 'Whether or not to save logs, individual test script output and reports' +
      '\nSave destination will be:' +
      '\nruns/run_<script>_<timestamp>_<numUsers>_<concurrency>_<rampUp>/' +
      '\ne.g. runs/run_test.js_1329317523630_100_10_5/'
  })
  .options('p', {
    'alias': 'profile',
    'demand': false,
    'describe': 'Only usefull if "-o true".\nProfile name, will be appended to output directory name:' +
      '\ne.g. runs/run_test.js_1329317523630_100_10_5-profilename/'
  })
  .wrap(100).argv;

var logger = {
  logDir: '',
  info: function (msg) {
    console.log(msg);
    logger.appendFile('info.txt', msg);
    logger.verbose(msg, true);
    logger.silly(msg, true);
  },
  verbose: function (msg, dontConLog) {
    if (!dontConLog) {
      console.log(msg);
    }
    logger.appendFile('verbose.txt', msg);
    logger.silly(msg, true);
  },
  silly: function (msg, dontConLog) {
    if (!dontConLog) {
      console.log(msg);
    }
    logger.appendFile('silly.txt', msg);
  },
  appendFile: function (file, msg) {
    // TODO: will async fs operations make any difference here?
    if (saveOutput) {
      var fileId = fs.openSync(logger.logDir + '/' + file, 'a');
      fs.writeSync(fileId, '\n' + (new Date()).toJSON() + ' - ' + msg, null, 'utf8');
      fs.closeSync(fileId);
    }
  }
};

// Setup output directory
var outputDir = null;
var saveOutput = false;
var writeInProgess = 0;

if (typeof args.o === 'boolean' || args.o === 'true') {
  saveOutput = true;
  var runsDir = './runs';
  try {
    var stat = fs.lstatSync(runsDir);
    if (!stat.isDirectory()) {
      // not a directory, create it
      fs.mkdirSync(runsDir);
    }
  } catch (e) {
    // doesn't exist, create it
    fs.mkdirSync(runsDir);
  }
  outputDir = runsDir + '/run_' + args.s.replace(/\//g, '_') + '_' + Date.now() + '_' + args.n + '_' + args.c + '_' + args.r + '_' + args.p;
  fs.mkdirSync(outputDir);
  logger.logDir = outputDir;
  console.log('Output will be saved to ' + outputDir);
}

logger.info('Init info logging');
logger.verbose('Init verbose logging');
logger.silly('Init silly logging');

// objects for recording stats as test runs
var actionStats = [];
var successRuns = {
  'duration': new stats.Histogram(),
  'status': new stats.ResultsCounter()
};
var errorRuns = {
  'duration': new stats.Histogram(),
  'status': new stats.ResultsCounter()
};

var reports = {};
var reporting = null;
var genReport;

if (saveOutput) {
  reporting = require('nodeload/lib/reporting');
  genReport = reporting.REPORT_MANAGER.addReport('GENERAL');
  reports.core = {
    'conChart': genReport.getChart('Test Concurrency (shows rampup from 0 to c=' + args.c + ' over r=' + args.r + ' second(s), and wind down to 0 at end)'),
    'sucChart': genReport.getChart('Test Success/Fail (1=success, 0=fail)'),
    'timeChart': genReport.getChart('Time for each test to finish'),
    'testInProgressChart': genReport.getChart('Current number of tests in progress (should equal c=' + args.c + ', except in rampup and wind down period)'),
    'testInProgress': 0,
    'reqChart': genReport.getChart('Current number of test steps in progress'),
    'reqInProgress': 0,
    'testStartedChart': genReport.getChart('Number of tests started'),
    'testStarted': 0,
    'testEndedChart': genReport.getChart('Number of tests finished (should equal n=' + args.n + ' when finished)'),
    'testEnded': 0,
    'testSuccessChart': genReport.getChart('Number of tests succeeded'),
    'testSuccess': 0,
    'testErrorChart': genReport.getChart('Number of tests failed'),
    'testError': 0
  };
}

var l = new loop.MultiLoop({
  'numberOfTimes': args.n,
  'concurrency': args.c,
  'concurrencyProfile': [[0, 0], [args.r, args.c]],

  fun: function (finished) {
    logger.verbose('l.concurrency:' + l.concurrency);
    if (saveOutput) {
      reports.core.conChart.put({
        'concurrency': l.concurrency
      });
      reports.core.testInProgressChart.put({
        'tests': (reports.core.testInProgress++ + 1)
      });
      reports.core.testStartedChart.put({
        'tests': (reports.core.testStarted++ + 1)
      });
    }
    var curRuns = runs + 1;
    logger.info(curRuns + ':START');
    var start = Date.now();

    var scriptArgs = [args.s].concat(args._);

    scriptArgs.forEach(function(arg, i) {
      if (arg === '{runNum}') {
        scriptArgs[i] = curRuns;
      }
    });

    logger.verbose('spawing with args:' + JSON.stringify(scriptArgs));
    
    var test = spawn('node', scriptArgs);
    runs++;

    // Read in json output from test run
    var dataRaw = null;

    test.stdout.on('data', function (data) {
      logger.verbose(curRuns + ': received data length=' + data.length);
      // logger.info('data:'' + data.toString().substring(0,1) + ''');
      if (dataRaw === null) {
        dataRaw = '';
      }
      var dataString = (typeof data !== 'undefined') ? data.toString() : null;
      var dataFirstChar = (dataString.length > 0) ? dataString.substring(0, 1) : '';
      logger.silly(curRuns + ': dataFirstChar=' + dataFirstChar);
      // keep track of requests in progress if script tells us
      if (dataFirstChar === '!') {
        logger.silly('first char !');
        var chars = dataString.split('\n');
        chars = chars.splice(0, chars.length - ((dataString.substring(dataString.length - 1) === '\n') ? 1 : 0));
        for (var ci = 0, cl = chars.length; ci < cl; ci += 1) {
          var ct = chars[ci];
          logger.silly('ct=' + ct);
          if (ct.length > 2) {
            // got json response at end of test. let's not forget about it
            dataRaw += chars.splice(ci - 1, chars.length).join('\n');
            break;
          } else {
            if (saveOutput) {
              if (ct === '!+') {
                // logger.info('req++');
                reports.core.reqChart.put({
                  'requests': (reports.core.reqInProgress++ + 1)
                });
              } else if (ct === '!-') {
                // logger.info('req--');
                reports.core.reqChart.put({
                  'requests': (reports.core.reqInProgress-- - 1)
                });
              }
            }
          }
        }
      } else {
        dataRaw += data;
      }
    });

    test.stderr.on('data', function (data) {
      logger.info(curRuns + ': received error data:' + data);
      if (dataRaw === null) {
        dataRaw = '';
      }
      dataRaw += data;
    });

    test.on('close', function (code) {
      logger.info(curRuns + ':END - exit code = ' + code);
      if (saveOutput) {
        reports.core.conChart.put({
          'concurrency': l.loops.length
        });
        reports.core.testInProgressChart.put({
          'tests': (reports.core.testInProgress-- - 1)
        });
        reports.core.testEndedChart.put({
          'tests': (reports.core.testEnded++ + 1)
        });
      }
      // Record duration of test
      var duration = Date.now() - start;
      logger.verbose(curRuns + ':');
      if (saveOutput) {
        reports.core.timeChart.put({
          'duration': duration
        });
      }

      var success = (code === 0);
      var runsObj;
      if (success) {
        if (saveOutput) {
          reports.core.sucChart.put({
            'status': 1
          });
          reports.core.testSuccessChart.put({
            'tests': (reports.core.testSuccess++ + 1)
          });
        }
        runsObj = successRuns;
      } else {
        if (saveOutput) {
          reports.core.sucChart.put({
            'status': 0
          });
          reports.core.testErrorChart.put({
            'tests': (reports.core.testError++ + 1)
          });
        }
        runsObj = errorRuns;
      }

      runsObj.duration.put(duration);

      var dataJson = null;
      try {
        dataJson = JSON.parse(dataRaw);
        runsObj.status.put(dataJson.status);
        actionStats = actionStats.concat(dataJson.actions);

        // update graphs
        var calls = dataJson.actions;
        if (saveOutput) {
          for (var ci = 0, cl = calls.length; ci < cl; ci += 1) {
            var ct = calls[ci];
            if (reports[ct.action] == null) {
              reports[ct.action] = reporting.REPORT_MANAGER.addReport('Time for test step:' + ct.action.replace(/\//g, '_').replace(':', '_'));
            }
            logger.verbose('updating action chart:' + ct.action);
            var chart;
            if (success) {
              chart = reports[ct.action].getChart('SUCCESS');
              chart.put({
                'successDuration': ct.duration
              });
            } else {
              chart = reports[ct.action].getChart('ERROR');
              chart.put({
                'errorDuration': ct.duration
              });
            }
          }
        }
      } catch (e) {
        logger.info('Error iterating over test result calls: ' + util.inspect(e));
        logger.info('dataRaw:' + dataRaw);
        runsObj.status.put('error');
      }

      // if save output is true, create file containing actionStats in test output dir
      //       e.g. <curRuns>-<duration>.json

      var dataToWrite = (dataJson !== null) ? JSON.stringify(dataJson, null, 2) : (dataRaw !== null) ? ('RAW DATA\n' + dataRaw) : 'no content returned from test script';
      if (saveOutput) {
        // prefix zeros to run no. if required
        var prefixZeros = ('' + args.n).length;
        var curRunsLength = ('' + curRuns).length;
        var prefixedRuns = curRunsLength < prefixZeros ? ('' + (Math.pow(10, prefixZeros - curRunsLength))).substring(1) + curRuns : curRuns;

        var dataFileName = prefixedRuns + '-' + (success ? 'ok' : 'error') + '-' + duration + '.json';
        var dataFilePath = outputDir + '/' + dataFileName;

        fs.writeFile(dataFilePath, dataToWrite, function (err) {
          if (err) {
            logger.info(curRuns + ':Error writing file:' + dataFilePath + '\n' + err.message);
          }
        });

        // write log output if we have any
        if (dataJson !== null && (typeof dataJson.log !== 'undefined')) {
          fs.writeFile(dataFilePath.replace('.json', '.txt'), dataJson.log, function (err) {
            if (err) {
              logger.info(curRuns + ':Error writing file:' + dataFilePath + '\n' + err.message);
            }
          });
        }
      }

      // log all errors separately also
      if (!success) {
        logger.verbose(curRuns + ': Error response: ' + dataToWrite);
        logger.appendFile('errors.txt', curRuns + ':' + dataToWrite);
      }
      finished();
    });
  }
});

/** 
 * Utility to manage execution of scripts 'before' the start of load-test
 * the 'before' script will be passed same parsed arguments as the
 * 
 * @param {String} beforeScript - Path to the script to run
 * @param {Function} cb - Callback, will be passed process exitCode
 **/ 
var before = function (beforeScript, cb) {
  var scriptArgs = [args.b].concat(args._);
  var beforeScriptProcess = spawn('node', scriptArgs);

  beforeScriptProcess.on('exit', function onBeforeScriptExit(exitCode) {
    cb(exitCode);
  });
};

var startTime;

// if the '--before' script is set, run it and wait with running the tests until before script completes
if (args.b) {
  before(args.b, function (exitCode) {
    startTime = Date.now();
    l.start();
  });
} else {
  startTime = Date.now();
  l.start();
}

l.on('end', function () {
  var summary = {
    'duration': Date.now() - startTime,
    'successRuns': {
      'duration': successRuns.duration.summary(),
      'status': successRuns.status.summary()
    },
    'errorRuns': {
      'duration': errorRuns.duration.summary(),
      'status': errorRuns.status.summary()
    },
    'actions': []
  };

  // Build up stats for each action
  var resMap = {};
  for (var ti = 0, tl = actionStats.length; ti < tl; ti += 1) {
    var tt = actionStats[ti];
    var tRes = resMap[tt.action];
    if (!tRes) {
      tRes = resMap[tt.action] = {
        'successDuration': new stats.Histogram(),
        'errorDuration': new stats.Histogram(),
        'status': new stats.ResultsCounter(),
        'count': 0
      };
    }
    tRes.status.put(tt.status);
    if (tt.status !== 200 && tt.status !== 'complete' && tt.status !== 'ok') {
      tRes.errorDuration.put(tt.duration);
    } else {
      tRes.successDuration.put(tt.duration);
    }
    tRes.count += 1;
  }

  // Get stats summary for each action
  for (var action in resMap) {
    var tempStats = resMap[action];
    summary.actions.push({
      'action': action,
      'successDuration': tempStats.successDuration.summary(),
      'errorDuration': tempStats.errorDuration.summary(),
      'status': tempStats.status.summary(),
      'count': tempStats.count
    });
  }

  if (saveOutput) {
    // save summary to disk
    var summaryFilePath = outputDir + '/summary.json';
    writeInProgess++;
    fs.writeFile(summaryFilePath, JSON.stringify(summary, null, 2), function (err) {
      if (err) {
        logger.verbose('Error writing file:' + summaryFilePath + '\n' + err.message);
      }
      writeInProgess--;
    });
  }

  if (saveOutput) {
    logger.verbose('wating 5000ms for charting/fs operations to finish');
    setTimeout(function () {
      if (saveOutput) {
        var reportFile = reporting.REPORT_MANAGER.logNameOrObject;
        var destFile = outputDir + '/' + reportFile;
        logger.info('moving report results from ' + reportFile + ' to ' + destFile);
        fs.renameSync(reportFile, destFile);
      }
      finish(summary);
    }, 5000);
  } else {
    finish(summary);
  }
});

var finish = function (summary) {
  logger.verbose(JSON.stringify(summary, null, 2));
  process.exit(0);
};

if (saveOutput) {
  open('http://localhost:8000');
}
