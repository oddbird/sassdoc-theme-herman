'use strict';

const constants = {
  format: new Set(['eot', 'woff2', 'woff', 'ttf', 'otf', 'svg', 'svgz']),
  weight: new Set([
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    'bold',
    'bolder',
    'lighter',
  ]),
  style: new Set(['italic', 'oblique']),
  other: new Set(['normal', 'regular']),
};

const isValidVariant = str => {
  const splitVariant = str.split(' ');
  return (
    constants.weight.has(splitVariant[0]) ||
    constants.style.has(splitVariant[0]) ||
    constants.other.has(splitVariant[0])
  );
};

const isValidFormat = str => constants.format.has(str);

module.exports = {
  constants,
  isValidVariant,
  isValidFormat,
};
