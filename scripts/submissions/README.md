# Load Testing Script For Submissions

## Overview

This script allows you to load test the submission of forms through a Cloud App.

## Steps To Use

### Populating The Script Details

1. On a cluster, create a new form with a `text` and `file` field type.
2. Deploy the form to an `environment`.
3. Create a new form project.
4. Deploy the Cloud App to the same `environment` as the form was deployed to.
5. Associate the form with the project.
6. Get the Cloud App url from the Cloud App Dashboard.
7. Use `fhc appforms forms list` and `fhc appforms forms get` commands to get the JSON definition of the form.
8. Use the above information to populate the `test_submissions.js` file.

### Running The Script

When the script has the correct values, the script can be executed.

Like any standard load-runner task, the script can be run with the following command:

```
./bin/load-runner.js -s scripts/submissions/test_submissions.js -c 2 -n 10 -- -a https://testing-tvcw5mknd2oliiopmhkkjf62-dev.feedhenry.me/ -f 57e1109b014c445c314a729d -x 57e110b0014c445c314a729e -y 57e151524c70ee5212234c90

```

Where:
  * -a, --cloudappurl  Cloud App Url             [required]
  * -f, --formId       Form ID                   [required]
  * -x, --textFieldId  Text Field ID             [required]
  * -y, --fileFieldId  File Field ID             [required]
  * -z, --filePath     Path To A File To Upload  [default: "/load-runner/scripts/submissions/fixtures/signature.png"]

Note: To pass any commands onto the script being executed, finish with a -- followed by any arguments to the passed (as can be seen in the sample command above).

The above script will run 10 submissions with a concurrency of 2.
