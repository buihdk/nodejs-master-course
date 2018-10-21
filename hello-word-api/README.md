To generate RSA private key and SSL Certificate, run this in terminal within the `./hello-word-api/https` directory:
```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

Run this in terminal within the `./hello-word-api` directory to start server in staging (default) environment
```
node index.js
```
* HTTP: `http://www.localhost:3000` 
* HTTPS: `https://www.localhost:3001` 
* Available routes: `/hello`, `/ping`, and `/sample`

Run this in terminal within the `./hello-word-api` directory start server in production environment:
```
NODE_ENV=production node index.js
```
* HTTP: `http://www.localhost:5000` 
* HTTPS: `https://www.localhost:5001` 
* Available routes: `/hello`, `/ping`, and `/sample`