var fh = require('fh-fhc');

module.exports = function deployApp (appGuid, env) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      fh.app.stage({
        'app': appGuid,
        'env': env
      }, (err, ok) => {
        if (err) {
          console.log({message: 'error deploy app', err: err});
          return reject(err);
        }
        return resolve(ok);
      });
    }, 5000);
  });
};
