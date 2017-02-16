## GUIDE TO RUN test_create_deploy test



clone this repo and fh-fhc. 

```
cd fh-fhc
sudo npm link .
cd load_runner
npm install .
sudo npm link fh-fhc

```


To run the test use the following command:
Before running the test ensure auto deploy is disabled. This is under the deploy screen for the app


```
./bin/load-runner.js -s ./scripts/test_create_deploy.js -c 2 -n 5 -r 10 -o  --  -u testing-admin@example.com -p Password1 -g https://github.com/maleck13/loadrunner_cloud_app.git  -h https://testing.feedhenry.me -e dev


before the -- are the load runner args. So here we are doing concurrency 2 number of tests 5 ramp up over 10 milliseconds.
after the -- are the script args -u the user -p the password for that user -g a git repo to clone the app from -h the host to target -e the environment to deploy to


```

A useful command for cleaning up after the tests.

```
for p in `fhc projects --bare`
do
  fhc projects delete $p
done  

```


## GUIDE TO RUN test_app_api

To run this test should first have a number of apps deployed and have there guids available.

The test can then be run using the following command

```
./bin/load-runner.js -s ./scripts/test_app_api.js -c 1 -n 1 -r 10 -o  --  -u testing-admin@example.com -p Password1  -h https://testing.feedhenry.me -e dev --endpoint fhdb -a zby2bhlbtmxcnwk27e64cutg -t 10

```
