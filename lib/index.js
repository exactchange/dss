/* eslint-disable no-magic-numbers, max-len */

const fs = require('fs').promises;

const { generateUUID } = require('cryptography-utilities');

const FILE_SIZE_LIMIT = 500000;

const MEDIA_TYPES = {
  base64: 'b64'
};

const defaultMediaType = Object.keys(MEDIA_TYPES)[0];

const Database = dataURI => {
  let getObjects;
  let updateObjects;
  let deleteObjects;
  let backupObjects;
  let storeMedia;
  let searchMedia;

  backupObjects = async (collectionName, page = 1) => {
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
      ? documents.sort().slice(-page)[0]
      : collectionName;

    const fileSrc = `${dataURI}/${fileName}.json`;

    const data = await fs.readFile(fileSrc, 'utf8');

    await fs.writeFile(
      `${dataURI}/backups/${collectionName}-${Date.now()}.json`,
      data,
      'utf8'
    );

    return {
      read: getObjects,
      write: updateObjects,
      delete: deleteObjects,
      backup: backupObjects,
      store: storeMedia,
      search: searchMedia
    };
  };

  getObjects = async (collectionName, query, page, limit = 1000) => {
    const files = await fs.readdir(dataURI);

    const collection = files
      .filter(file => (
        file
          .split('.')[0]
          .split('-')[0] === collectionName
      ))
      .map(file => (
        file.replace('.json', '')
      ));

    const documents = [
      collection[page ? page - 1 : 0] ||
      null
    ].filter(Boolean);

    let concatResult = [];

    for (const document of documents) {
      const fileName = documents.length > 1
        ? document
        : collectionName;

      const fileSrc = `${dataURI}/${fileName}.json`;

      const { size } = await fs.stat(fileSrc);

      if (size > FILE_SIZE_LIMIT) {
        console.log(
          `<DB> :: WARNING in document "${collectionName}.json": File size of ${size.toLocaleString()} bytes exceeds the limit of ${FILE_SIZE_LIMIT / 1000}kb.`
        );
      }

      const data = await fs.readFile(fileSrc, 'utf8');

      let result = Object.values(JSON.parse(data || '{}'));

      if (query) {
        result.forEach(record => {
          Object.keys(record).forEach(key => {
            // eslint-disable-next-line no-magic-numbers
            if (key === Object.keys(query)[0] && record[key] === query[key]) {
              result = record;
            }
          });
        });
      }

      concatResult = concatResult.concat(result);
    }

    return {
      data: concatResult.slice(-limit),
      read: getObjects,
      write: updateObjects,
      delete: deleteObjects,
      backup: backupObjects,
      store: storeMedia,
      search: searchMedia
    };
  };

  updateObjects = async (collectionName, query, collectionItem) => {
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

    const collection = JSON.parse(data || '{}');

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
      read: getObjects,
      write: updateObjects,
      delete: deleteObjects,
      backup: backupObjects,
      store: storeMedia,
      search: searchMedia
    };
  };

  deleteObjects = async (collectionName, query, selection) => {
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

    const collection = JSON.parse(data || '{}');

    if (query) {
      for (const _id of Object.keys(collection)) {
        const record = collection[_id];

        if (record) {
          for (const key of Object.keys(record)) {
            // eslint-disable-next-line no-magic-numbers
            if (key === Object.keys(query)[0] && record[key] === query[key]) {
              if (selection) {
                for (const keyName of selection) {
                  delete collection[_id][keyName];
                }
              } else {
                delete collection[_id];

                break;
              }
            }
          }
        }
      }

      await fs.writeFile(
        fileSrc,
        JSON.stringify(collection),
        'utf8'
      );
    } else {
      try {
        await fs.access(fileSrc);

        await fs.unlink(fileSrc);
      } catch (error) {
        console.log(
          `<DB> :: Failed to unlink a file (${fileSrc}). File does not exist.`
        );
      }
    }

    return {
      data: { deletedAt: Date.now() },
      read: getObjects,
      write: updateObjects,
      delete: deleteObjects,
      backup: backupObjects,
      store: storeMedia,
      search: searchMedia
    };
  };

  storeMedia = async (media, mediaType = defaultMediaType) => {
    const fileId = generateUUID();
    const extension = MEDIA_TYPES[mediaType];

    await fs.writeFile(`${dataURI}/${extension}/${fileId}.${extension}`, media, 'utf8');

    return `data:image/${fileId}`;
  };

  searchMedia = async (mediaAddress, mediaType = defaultMediaType) => {
    const extension = MEDIA_TYPES[mediaType];

    return fs.readFile(`${dataURI}/${extension}/${mediaAddress}.${extension}`, 'utf8');
  };

  return {
    read: getObjects,
    write: updateObjects,
    delete: deleteObjects,
    backup: backupObjects,
    store: storeMedia,
    search: searchMedia
  };
};

module.exports = dataURI => Database(dataURI);
