const dotenv = require('dotenv');

dotenv.config();

const {
  NODE = '',
  API_KEY,
  HOST,
  PORT
} = process.env;

const NODE_ENV = process.env.NODE_ENV || NODE.match(/home\//) ? 'development' : 'production';

module.exports = {
  API_KEY,
  NODE_ENV,
  HOST,
  PORT,
  URL: HOST,
  // URL: `${HOST}:${PORT}`
};
