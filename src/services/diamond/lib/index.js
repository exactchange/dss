/* eslint-disable no-magic-numbers */

const fs = require('fs').promises;

const { generateUUID } = require('../../../utilities');

let getCollection, updateCollection;

getCollection = async (collectionName, query) => {
  const data = await fs.readFile(`${__dirname}/../data/${collectionName}.json`, 'utf8');

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
    write: updateCollection
  };
};

updateCollection = async (collectionName, query, collectionItem) => {
  const data = await fs.readFile(`${__dirname}/../data/${collectionName}.json`, 'utf8');

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
    `${__dirname}/../data/${collectionName}.json`,
    JSON.stringify({
      ...collection,
      ...result
    }),
    'utf8'
  );

  return {
    data: result,
    read: getCollection
  };
};

module.exports = {
  getCollection,
  updateCollection,
  read: getCollection,
  write: updateCollection
};
