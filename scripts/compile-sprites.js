/* eslint-disable no-console */

'use strict';

const fs = require('fs');

const path = require('path');
const chalk = require('chalk');

const generateSprites = require('../lib/utils/icons');

const output = path.join(__dirname, '../templates/_icons.svg');

generateSprites('assets/svg/')
  .then((result) =>
    fs.writeFile(output, result, (err) => {
      if (err) {
        throw err;
      }
    }),
  )
  .catch((err) => {
    console.error(chalk.red(err));
  });
