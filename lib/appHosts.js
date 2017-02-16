var fh = require('fh-fhc');

module.exports = function hosts (appId, env) {
  return new Promise((resolve, reject) => {
    fh.app.hosts({'app': appId, 'env': env}, (err, host) => {
      if (err) return reject(err);
      return resolve(host);
    });
  });
};
