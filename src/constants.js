const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const {
  NODE = '',
  DATA_URI,
  HOST,
  PORT
} = process.env;

const NODE_ENV = process.env.NODE_ENV || NODE.match(/home\//) ? 'development' : 'production';
const DB_URI = path.join(`${DATA_URI || __dirname}`, 'diamond/data');

module.exports = {
  NODE_ENV,
  DATA_URI: DB_URI,
  HOST,
  PORT,
  URL: HOST
};
