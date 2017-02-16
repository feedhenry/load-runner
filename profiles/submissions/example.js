module.exports = {
  //script file
  script: './script/submissions/test_submissions.js',

  // run profiles, load-runner configs along with script args.
  profiles: [
    {
      name: 'basic',
      concurency: 1,
      numUsers: 1,
      rampUp: 10,
      before: null,
    //   Where:
    //   * -a, --cloudappurl  Cloud App Url             [required]
    //   * -f, --formId       Form ID                   [required]
    //   * -x, --textFieldId  Text Field ID             [required]
    //   * -y, --fileFieldId  File Field ID             [required]
    //   * -z, --filePath     Path To A File To Upload  [default: "/load-runner/scripts/submissions/fixtures/signature.png"]
      script_args:
        '-a http://testing-xdz52zaady473yrjgun7t34r-test.feedhenry.me ' +
        '-f 58220bcf3119512375c67360 ' +
        '-x 58220be03119512375c67361 ' +
        '-y 58220be03119512375c67362'
    },
    {
      name: 'second_basic',
      concurency: 1,
      numUsers: 1,
      rampUp: 10,
      before: null,
      //   Where:
      //   * -a, --cloudappurl  Cloud App Url             [required]
      //   * -f, --formId       Form ID                   [required]
      //   * -x, --textFieldId  Text Field ID             [required]
      //   * -y, --fileFieldId  File Field ID             [required]
      //   * -z, --filePath     Path To A File To Upload  [default: "/load-runner/scripts/submissions/fixtures/signature.png"]
      script_args:
      '-a http://testing-xdz52zaady473yrjgun7t34r-test.feedhenry.me ' +
      '-f 58220bcf3119512375c67360 ' +
      '-x 58220be03119512375c67361 ' +
      '-y 58220be03119512375c67362'
    }
  ]
};
