/*
Load runner helper for sending messages back to the runner
Uses stdout to send messages.

TODO:
- Potential for using a better mechanism here as messages are completely non-standard.
  e.g.
    !+  = step started
    !-  = step finished

After all steps finished, a call to finish() outputs all test data for the steps as json,
which load runner parses and maps out in graphs and results files
*/

var util = require('util');

module.exports = function () {
  var lr = {
    logArr: ['lr started'],

    ids: {},

    acts: [],

    log: function (msg) {
      lr.logArr.push((new Date()).toJSON() + ' - ' + msg);
    },

    actStart: function (id) {
      console.log('!+');
      lr.log('act started:' + id);
      lr.ids[id] = {
        'start': Date.now()
      };
    },

    actEnd: function (id, status, other) {
      console.log('!-');
      var act = {
        'action': id,
        'duration': (Date.now() - lr.ids[id].start),
        'status': status || 'ok'
      };
      if (typeof other !== 'undefined') {
        act.other = other;
      }
      lr.acts.push(act);
      lr.log('act ended:' + id + ' :: duration=' + act.duration);
    },

    checkError: function (err) {
      lr.log('action finished :: err=' + typeof err + ' ' + util.inspect(err));
      if (err) {
        return lr.finish(1);
      }
    },

    finish: function (status) {
      console.log(JSON.stringify({
        'status': status,
        'actions': lr.acts,
        'log': lr.logArr
      }, null, 2));
      process.exit(typeof status === 'number' ? status : 0);
    }
  };
  return lr;
};
