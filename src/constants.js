const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const {
  NODE = '',
  API_KEY,
  DATA_PATH,
  HOST,
  PORT
} = process.env;

const NODE_ENV = process.env.NODE_ENV || NODE.match(/home\//) ? 'development' : 'production';
const DATA_URI = path.join(__dirname, DATA_PATH);

module.exports = {
  API_KEY,
  NODE_ENV,
  DATA_URI,
  HOST,
  PORT,
  URL: HOST
};
