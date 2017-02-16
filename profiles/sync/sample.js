
module.exports = {
  //script file
  script: 'submissions/test_submissions.js',

  // run profiles, load-runner configs along with script args.
  profiles: [
    {
      name: 'basic',
      concurency: 1,
      numUsers: 1,
      rampUp: 10,
      before: null,
      script_args: {
        interval: 5
      }
    },
    {
      name: 'agregate',
      concurency: 2,
      numUsers: 1600,
      rampUp: 10,
      before: null,
      script_args: {
        interval: 15
      }
    }
  ]
};