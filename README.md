# LTI-Provider (example for NodeJS)
A short tutorial on how to provide LTI in an application with NodeJS.

### Requirements

* NodeJS
* MongoDB

### How to run the example

To run the example clone this repository and enter the following in your terminal:

```bash
cd node-lti-provider-example
npm install
node app.js
```

The LTI endpoint is available via POST at: <br>
```
http://localhost:4000/lti/
```

You can send a POST request to the following URL to generate a consumer key pair: <br>
```
http://localhost:4000/lti/consumer/
```

The main application is accessible at:
```
http://localhost:4000/app/
```

***
