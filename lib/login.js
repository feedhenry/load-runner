var fh = require('fh-fhc');

var load = function () {
  return new Promise((resolve, reject) => {
    fh.load({
      'loglevel': 'error',
      'json': true,
      'inmemoryconfig': true
    }, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

function target (target) {
  return new Promise((resolve, reject) => {
    fh.target({_: [target]}, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function login (user, pass) {
  return new Promise((resolve, reject) => {
    fh.login({_: [user, pass]}, (err, res) => {
      if (err) {
        return reject(err);
      }
      console.log(res);
      return resolve(res);
    });
  });
}

module.exports = function doLogin (user, pass, host) {
  return load()
      .then(() => target(host))
      .then(() => login(user, pass));
};
