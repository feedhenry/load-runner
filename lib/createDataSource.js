var fh = require('fh-fhc');

module.exports = function (params) {
  return new Promise((resolve, reject) => {
    fh.appforms['data-sources'].create({
      name: params.title,
      serviceGuid: params.service,
      endpoint: params.path,
      refreshInterval: params.refresh,
      description: params.desc,
      numAuditLogEntries: params.logEntries}, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
