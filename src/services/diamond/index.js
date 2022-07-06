/* eslint-disable no-magic-numbers */

// Library export - Import this file to use diamond as an http microservice
// Default export (/index.js) - To run diamond as a standalone web server

(() => {
  const { http } = require('node-service-client');

  const { DATA_URI } = require('../../constants');

  const dss = require('./lib')(DATA_URI);

  module.exports = http({
    GET: {},
    POST: {
      read: async ({ collectionName, query }) => (
        dss.read(collectionName, query)
      ),
      write: async ({ collectionName, query, payload }) => (
        dss.write(collectionName, query, payload)
      ),
      backup: async ({ collectionName }) => (
        dss.backup(collectionName)
      ),
      store: async ({ media }) => (
        dss.store(media)
      ),
      search: async ({ mediaAddress }) => (
        dss.search(mediaAddress)
      )
    },
    PUT: {},
    DELETE: {}
  });
})();
