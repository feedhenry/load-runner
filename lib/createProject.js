var fh = require('fh-fhc');
var template_id = 'hello_world_project';

module.exports = function (project) {
  return new Promise((resolve, reject) => {
    fh.projects({_: ['create', project, template_id], 'env': 'none'}, (err, project) => {
      if (err) {
        console.error({message: 'failed to create project', err: err});
        return reject(err);
      }
      return resolve(project);
    });
  });
};
