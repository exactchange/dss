/* eslint-disable no-magic-numbers */

const { http } = require('node-service-library');

const { DATA_URI } = require('./constants');

const dss = require('./lib')(DATA_URI);

module.exports = http({
  GET: {},
  POST: {
    read: async ({ collectionName, query, page }) => (
      dss.read(collectionName, query, page)
    ),
    write: async ({ collectionName, query, payload }) => (
      dss.write(collectionName, query, payload)
    ),
    backup: async ({ collectionName }) => (
      dss.backup(collectionName)
    ),
    store: async ({ media, mediaType }) => (
      dss.store(media, mediaType)
    ),
    search: async ({ mediaAddress, mediaType }) => (
      dss.search(mediaAddress, mediaType)
    )
  },
  PUT: {},
  DELETE: {}
});
