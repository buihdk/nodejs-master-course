/*
 * Primary file for the API
 *
 */

// Dependencies (built-in Node)
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');

// TESTING
// TEST CREATE
// _data.create('test', 'newFile2', {'foo': 'bar'}, function(err) {
//   console.log('this was the error', err);
// });
// TEST READ
// _data.read('test', 'newFile3', function(err, data) {
//   console.log('this was the error', err, 'and this was the data', data);
// });
// TEST UPDATE
// _data.update('test', 'newFile', {'fizz': 'buzz'}, function(err) {
//   console.log('this was the error', err);
// });
// TEST DELETE
// _data.delete('test', 'newFile2', function(err) {
//   console.log('this was the error', err);
// });

// Instantiate the HTTP server
var httpServer = http.createServer(function(req,res) { // req: request, res: response
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req,res) { // req: request, res: response
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log(`The server is listening on port ${config.httpsPort}`);
})

// All the server logic for both the http and https server
var unifiedServer = function(req, res) {
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true); // pass 'true' to get the query string to parsedUrl

  // Get the path 
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  
  // Get the HTTP method
  var method = req.method.toUpperCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8'); // use utf8 decoder
  var buffer = ''; // buffer is just a placeholder for payload data
  req.on('data', function(data) { // 'data(payload)' event handler (sometimes payload is empty)
    buffer += decoder.write(data); // use utf8 decoder to turn data streaming in to simple string and store in buffer
  })
  req.on('end', function() { // 'end' event handler
    buffer += decoder.end();

    // Choose the handler this request should go to 
    // If one is not found, use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      
      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      
      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path
      console.log('Request received with these headers: ', headers);
      console.log(`Request received on path: ${trimmedPath} with method: ${method} and with these query string parameters: ${JSON.stringify(queryStringObject)}`);
      console.log('Request received with this payload: ', buffer);
      console.info('Returning this response: ', statusCode, payloadString);
    });
  })
}

// Define the handlers
var handlers = {};

// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
}

// Sample handler
handlers.sample = function(data, callback) {
  // Callback a http status code, and a payload object
  callback(406, {'name': 'sample handler'});
};

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a request router
var router = {
  'sample' : handlers.sample,
  'ping' : handlers.ping
};