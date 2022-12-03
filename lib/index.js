/* eslint-disable no-magic-numbers, max-len */

const fs = require('fs').promises;

const { generateUUID } = require('cryptography-utilities');

const MEDIA_TYPES = {
  base64: 'b64',
  json: 'json'
};

const FILE_SIZE_LIMIT = 500000;

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
    const files = await fs.readdir(dataURI);

    const documents = files
      .filter(file => (
        file
          .split('.')[0]
          .split('-')[0] === collectionName
      ))
      .map(file => (
        file.replace('.json', '')
      ));

    const fileName = documents.length > 1
      ? documents.sort().pop()
      : collectionName;

    const fileSrc = `${dataURI}/${fileName}.json`;

    const { size } = await fs.stat(fileSrc);

    if (size > FILE_SIZE_LIMIT) {
      console.log(
        `<DB> :: WARNING in document "${collectionName}.json": File size of ${size.toLocaleString()} bytes exceeds the limit of ${FILE_SIZE_LIMIT / 1000}kb.`
      );
    }

    const data = await fs.readFile(fileSrc, 'utf8');

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
    const files = await fs.readdir(dataURI);

    const documents = files
      .filter(file => (
        file
          .split('.')[0]
          .split('-')[0] === collectionName
      ))
      .map(file => (
        file.replace('.json', '')
      ));

    const fileName = documents.length > 1
      ? documents.sort().pop()
      : collectionName;

    const fileSrc = `${dataURI}/${fileName}.json`;

    const data = await fs.readFile(fileSrc, 'utf8');

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
      fileSrc,
      JSON.stringify({
        ...collection,
        ...result
      }),
      'utf8'
    );

    const { size } = await fs.stat(fileSrc);

    if (size > FILE_SIZE_LIMIT) {
      await fs.writeFile(
        `${dataURI}/${collectionName}-${Date.now()}.json`,
        '{}',
        'utf8'
      );
    }

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

    return `data:${mediaType === 'json' ? 'json' : 'image'}/${fileId}`;
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
