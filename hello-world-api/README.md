# Hello World API

To start, run this in terminal: 
```
git clone git@github.com:buihdk/nodejs-master-course.git
```

Go to `hello-world-api` directory.

Run this in terminal to start server in staging (default) environment:
```
node index.js
```
* HTTP: `http://www.localhost:3000` 
* HTTPS: `https://www.localhost:3001` 
* Available routes: `/hello`, `/ping`, and `/sample`

Run this in terminal to start server in production environment:
```
NODE_ENV=production node index.js
```
* HTTP: `http://www.localhost:5000` 
* HTTPS: `https://www.localhost:5001` 
* Available routes: `/hello`, `/ping`, and `/sample`

To generate new RSA private key `key.pem` and SSL Certificate `cert.pem`, run this in terminal within the `hello-world-api/https` directory:
```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

