/* eslint-disable no-magic-numbers */

module.exports = {
  generateUUID: () => {
    const g4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0)
        .toString(16)
        .substring(1);
    };

    return (
      `${g4()}${g4()}-${g4()}-${g4()}-${g4()}-${g4()}${g4()}${g4()}`
    );
  }
};
