const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const {
  DATA_URI,
  HOST,
  PORT
} = process.env;

const DB_URI = path.join(`${DATA_URI || __dirname}`, 'diamond/data');

module.exports = {
  DATA_URI: DB_URI,
  HOST,
  PORT,
  URL: HOST
};
