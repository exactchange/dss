/* eslint-disable no-magic-numbers */

const fs = require('fs').promises;

const { generateUUID } = require('../../../utilities');

const MEDIA_TYPES = {
  base64: 'b64',
  json: 'json'
};

const Database = dataURI => {
  let getCollection, updateCollection, backupCollection, storeMedia;

  backupCollection = async collectionName => {
    const data = await fs.readFile(`${dataURI}/${collectionName}.json`, 'utf8');

    await fs.writeFile(
      `${dataURI}/${collectionName}-${Date.now()}.json`,
      data,
      'utf8'
    );

    return {
      read: getCollection,
      write: updateCollection,
      backup: backupCollection
    };
  };

  getCollection = async (collectionName, query) => {
    const data = await fs.readFile(`${dataURI}/${collectionName}.json`, 'utf8');

    let result = Object.values(JSON.parse(data));

    if (query) {
      result.forEach(record => {
        Object.keys(record).forEach(key => {
          // eslint-disable-next-line no-magic-numbers
          if (key === Object.keys(query)[0] && record[key] === query[key]) {
            result = record[key];
          }
        });
      });
    }

    return {
      data: result,
      read: getCollection,
      write: updateCollection,
      backup: backupCollection
    };
  };

  updateCollection = async (collectionName, query, collectionItem) => {
    const data = await fs.readFile(`${dataURI}/${collectionName}.json`, 'utf8');

    const collection = JSON.parse(data);

    let result, didUpdate = false;

    if (query) {
      Object.values(collection).forEach(record => {
        Object.keys(record).forEach(key => {
          // eslint-disable-next-line no-magic-numbers
          if (key === Object.keys(query)[0] && record[key] === query[key]) {
            result = {
              [record._id]: {
                ...record,

                ...collectionItem
              }
            };

            didUpdate = true;
          }
        });
      });
    }

    if (!didUpdate) {
      const id = generateUUID();

      result = {
        [id]: {
          _id: id,

          ...collectionItem
        }
      };
    }

    await fs.writeFile(
      `${dataURI}/${collectionName}.json`,
      JSON.stringify({
        ...collection,
        ...result
      }),
      'utf8'
    );

    return {
      data: result,
      read: getCollection,
      write: updateCollection,
      backup: backupCollection
    };
  };

  storeMedia = async (media, mediaType = Object.keys(MEDIA_TYPES)[0]) => {
    const fileId = generateUUID();
    const extension = MEDIA_TYPES[mediaType];

    await fs.writeFile(`${dataURI}/${extension}/${fileId}.${extension}`, media, 'utf8');

    return `data:image/${fileId}`;
  };

  searchMedia = async (mediaAddress, mediaType = Object.keys(MEDIA_TYPES)[0]) => {
    const extension = MEDIA_TYPES[mediaType];

    return fs.readFile(`${dataURI}/${extension}/${mediaAddress}.${extension}`, 'utf8');
  };

  return {
    read: getCollection,
    write: updateCollection,
    backup: backupCollection,
    store: storeMedia,
    search: searchMedia
  };
};

module.exports = dataURI => Database(dataURI);
