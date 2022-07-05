const { NODE_ENV, PORT, URL } = require('./src/constants');

// Define backend services

const Services = {
  "Diamond": {}
};

// Configure HTTP

const express = require('express');
const cors = require('cors');

const Http = express();

Http.use(express.json({ limit: '10mb' }));
Http.use(express.urlencoded({ extended: false, limit: '10mb' }));
Http.use(cors());

// Middleware: https/www redirect

Http.use((req, res, next) => {
  let host = req.headers.host;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      if (!req.headers.host.match('www.')) {
        host = `www.${host}`;
      }

      return res.redirect(`https://${host}${req.url}`);
    }
  }

  return next();
});

const server = require('http').createServer(Http);

server.listen(PORT, () => {
  console.log(`Service "Http" is online at ${URL}`);

  // Start backend services

  Services.Diamond = require('./src/services/diamond');

  // Ping handler

  Http.get('/', (_, res) => res.send('<Diamond Search & Store> is online.'));

  // Route service requests

  Object.keys(Services).forEach(name => {
    const slug = (
      `/${name.toLowerCase().replace(/[^\w]+/g, '-')}`
    );

    const Service = Services[name];

    if (Object.keys(Service).length) {

      console.log(`Service "${name}" is online at ${URL}${slug}`);

      // Handle http

      if (Service.type === 'http') {
        Http.get(`${slug}/*`, (req, res) => {
          if (Object.keys(req.query).length) {
            return Service.onHttpSearch(req, res);
          }

          return Service.onHttpGet(req, res);
        });

        Http.post(`${slug}/*`, (req, res) => (
          Service.onHttpPost(req, res)
        ));

        Http.put(`${slug}/*`, (req, res) => (
          Service.onHttpPut(req, res)
        ));

        Http.delete(`${slug}/*`, (req, res) => (
          Service.onHttpDelete(req, res)
        ));
      }
    }
  });
});
