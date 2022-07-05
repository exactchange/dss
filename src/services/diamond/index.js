/* eslint-disable no-magic-numbers */

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
      },
      backup: async ({ apiKey, collectionName }) => {
        console.log('<Diamond> :: POST /diamond/backup');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.backup(collectionName);
      },
      sync: async ({ apiKey, collectionName }) => {
        console.log('<Diamond> :: POST /diamond/sync');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.sync(collectionName);
      },
      store: async ({ apiKey, media }) => {
        console.log('<Diamond> :: POST /diamond/store');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.store(media);
      },
      search: async ({ apiKey, mediaAddress }) => {
        console.log('<Diamond> :: POST /diamond/search');

        if (apiKey !== API_KEY) {
          return NOT_ALLOWED_ERROR;
        }

        return dss.search(mediaAddress);
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
