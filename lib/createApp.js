var fh = require('fh-fhc');

exports.createCloudAppInProject = function (projectGuid, gitUrl) {
  var title = 'loadrunner' + projectGuid + Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
  return new Promise((resolve, reject) => {
    fh.app.create({'project': projectGuid, 'repo': gitUrl, 'title': title, 'type': 'cloud_nodejs', 'wait': true}, (err, app) => {
      if (err) return reject(err);
      return resolve(app);
    });
  });
};
