1. Install the pre-requisites:

- install casperjs (http://casperjs.org/installation.html)
- install Python with requests

2. Configure your Datawrapper domain:

    export DATAWRAPPER_DOMAIN=http://datawrapper

3. Run the test:

    casperjs session.test.coffee
    python api.test.py
