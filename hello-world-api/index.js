'use strict';

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Define func unifiedServer 
const unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parsedUrl.query;
  const method = req.method.toUpperCase();
  const headers = req.headers;
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', data => buffer += decoder.write(data));
  req.on('end', () => { 
    buffer += decoder.end();
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    const data = { trimmedPath, queryStringObject, method, headers, payload: buffer };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('-----------------------------------------------');
      console.info('Request received with these headers: ', headers);
      console.info(`Request received on path: ${trimmedPath} with method: ${method} and with these query string parameters: ${JSON.stringify(queryStringObject)}`);
      console.info('Request received with this payload: ', buffer);
      console.info('Returning this response: ', statusCode, payloadString);
      console.log('-----------------------------------------------');
    });
  });
}

// Define func getWelcomeMsg
const arrWelcomeMsg = [
  'Hey! We are super excited to have you on board!',
  'May your stay here be safe and comfortable!',
  'Thanks for dropping by to see us!',
  'Welcome to the dark side. We have been expecting...',
  'Welcome! Beware of wife. Kids and pets are also shady. Husband is cool.',
  'Welcome home, darling!',
  'I was going to greet you but Facebook is not working!',
  'You have officially joined the cave! Welcome!',
  'Welcome! The neighbors have better stuff...',
  'Doorbell broken. Yell DING DONG! really loud.',
  'Now entering drama free zone...',
  'Just so you know, everyday is hump day for our dog.',
  'Come back when you have tacos & booze!',
];
const getWelcomeMsg = () => {
  const randomIndex = Math.floor(Math.random()*arrWelcomeMsg.length);
  return { id: randomIndex, message: arrWelcomeMsg[randomIndex] };
};

// Instantiate and start http server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));
httpServer.listen(config.httpPort, () => console.log(`The server is listening on port ${config.httpPort}`));

// Instantiate and start https server
const httpsServerOptions = {  key: fs.readFileSync('./https/key.pem'), cert: fs.readFileSync('./https/cert.pem') };
const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res));
httpsServer.listen(config.httpsPort, () => console.log(`The server is listening on port ${config.httpsPort}`));

// Define handlers
const handlers = {
  ping: (data, callback) => callback(200),
  hello: (data, callback) => callback(200, getWelcomeMsg()),
  sample: (data, callback) => callback(406, { message: 'This is a sample message.' }),
  notFound: (data, callback) => callback(404, { message: 'Sorry, that page never returned home from a trip to the Bermuda Triangle.' })
};

// Define a request router
const router = {
  ping: handlers.ping,
  sample: handlers.sample,
  hello: handlers.hello
};