/* eslint-disable no-magic-numbers */

/*
 *
 * Service
 * (default)
 *
 */

(() => {

  const { http } = require('node-service-client');

  const { API_KEY } = require('../../constants');
  const { NOT_ALLOWED_ERROR } = require('../../errors');

  const dss = require('./lib');

  /*
  Service (HTTP)
  */

  module.exports = http({
    GET: {},
    POST: {
      read: async ({ apiKey, collectionName, query }) => {
        console.log('<Diamond> :: POST /diamond/read');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.read(collectionName, query);
      },
      write: async ({ apiKey, collectionName, query, payload }) => {
        console.log('<Diamond> :: POST /diamond/write');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.write(collectionName, query, payload);
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
