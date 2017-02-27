# Usage

```
npm install
./bin/load-runner.js
NOTE: To pass any commands onto the script being executed, finish with a -- followed by any arguments to the passed. You can also pass a placeholder `{runNum}` to pass in the current test run number.

Options:
  -c, --concurrency  Concurrency of Users                                               [default: 1]
  -n, --numUsers     Number of Users                                                    [default: 1]
  -r, --rampUp       Ramp up time to Concurrency of Users (in seconds)                  [default: 1]
  -b, --before       Library to execute before the start of tests
  -s, --script       Script to execute                                                    [required]
  --seed             Seed for random number generator (otherwise generated from current time)
                                                                                            [number]
  -o, --output       Whether or not to save logs, individual test script output and reports
                     Save destination will be:
                     runs/run_<script>_<timestamp>_<numUsers>_<concurrency>_<rampUp>/
                     e.g. runs/run_test.js_1329317523630_100_10_5/                [default: "false"]
  -p, --profile      Only usefull if "-o true".
                     Profile name, will be appended to output directory name:
                     e.g. runs/run_test.js_1329317523630_100_10_5-profilename/
```

For example:

```
./bin/load-runner.js -s ./scripts/dummy.js -c 5 -n 100 -r 10 -o
```

It is possible to send args to the script under test by adding -- after the load-runner args e.g.

```
./bin/load-runner.js -s ./scripts/dummy.js -c 5 -n 100 -r 10 -o -- -testarg1 testval1
```

# Environment variables

There are some environment variables generated for the test script that can be useful. You can use Node.js `process.env` object to access them.

* `LR_RUN_COUNT` - total number of runs, it's value of `-n` parameter
* `LR_RUN_NUMBER` - current test run number
* `LR_RAND` - randomly generated value for each run, float between 0 and 1, based on random generation with `--seed` parameter

Look at [scripts/dummy_env_vars.js](scripts/dummy_env_vars.js) for example of using this.

# Output

Specifying the `--output` or `-o`  flag will open a browser pointed at http://localhost:8000 for live stats for the running test.
After the test run is complete, various files are output to the `runs/` directory

* &lt;test_no&gt;-&lt;status&gt;-&lt;duration&gt;.json e.g. 01-ok-15336.json - A json version of a single tests results
* &lt;test_no&gt;-&lt;status&gt;-&lt;duration&gt;.txt e.g. 01-ok-15336.txt - A single tests log
* summary.json - A json summary of all test runs with durations of individual actions and statistics
* info.txt - A high level log of all test runs
* errors.txt - Optional log file showing all tests that have errors
* verbose.txt - A verbose log of all test runs
* results-&lt;timestamp&gt;.html e.g. results-2015-05-08T14:29:30.186Z.html - Copy of the final content served at http://localhost:8000 during the test run

For example:

```
ls -la runs/run_._scripts_test_happy.js_1431080790428_9_3_1/
total 536
drwxr-xr-x  16 admin  staff    544  8 May 15:54 .
drwxr-xr-x  13 admin  staff    442  8 May 15:46 ..
-rw-r--r--   1 admin  staff    393  8 May 11:26 1-ok-9592.json
-rw-r--r--   1 admin  staff    393  8 May 11:26 2-ok-8978.json
-rw-r--r--   1 admin  staff   2785  8 May 11:26 3-ok-9288.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 4-error-577.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 5-error-621.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 6-error-602.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 7-error-605.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 8-error-603.json
-rw-r--r--   1 admin  staff   2882  8 May 11:26 9-error-573.json
-rw-r--r--   1 admin  staff  17562  8 May 11:26 errors.txt
-rw-r--r--   1 admin  staff  43016  8 May 11:26 info.txt
-rw-r--r--   1 admin  staff  86949  8 May 11:26 results-2015-05-08T10:26:30.407Z.html
-rw-r--r--   1 admin  staff   2228  8 May 11:26 summary.json
-rw-r--r--   1 admin  staff  74045  8 May 11:26 verbose.txt
```

# Writing a test

See scripts/dummy.js or scripts/test_happy.js for an example of writing a test

# Running custom code before test-script starts

If you need to run same set of tasks before every load-testing run,
consider adding them to the `./setup` folder as a javascript module, and
reference this module in `./setup/index.js`.

You will be able to run this code automatically by specifying the `-b` parameter:

```
./bin/load-runner.js -b create_deploy_app -s ./scripts/test_app_api.js -c 10 -n 100 -r 1 -o  -- --projectName loadtest0 -u testing-admin@example.com -p Password1  -h testing.zeta.feedhenry.com -e test --endpoint hello -t 100
```

will run function specified in `./setup/create_deploy_app.js` ad referenced in `index.js`.
The runner will pass this function parsed parameters from commandline after the `--` and expects
the function to return a promise.

# Requirements

Node version 4.4 and above.
