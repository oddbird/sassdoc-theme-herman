'use strict';

const weightMap = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  'extra light': 200,
  'extra-light': 200,
  ultralight: 200,
  'ultra light': 200,
  'ultra-light': 200,
  light: 300,
  medium: 500,
  semibold: 600,
  'semi bold': 600,
  'semi-bold': 600,
  demibold: 600,
  'demi bold': 600,
  'demi-bold': 600,
  extrabold: 800,
  'extra bold': 800,
  'extra-bold': 800,
  ultrabold: 800,
  'ultra bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  extrablack: 950,
  'extra black': 950,
  'extra-black': 950,
  ultrablack: 950,
  'ultra black': 950,
  'ultra-black': 950,
};

const mapWeight = (weight) => weightMap[weight] || weight;

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
    // Unofficial (will be mapped):
    ...Object.keys(weightMap),
  ]),
  style: new Set(['italic', 'oblique']),
  other: new Set(['normal', 'regular']),
};

const isValidVariant = (str) => {
  const splitVariant = str.split(/[, ]+/);
  return (
    constants.weight.has(splitVariant[0]) ||
    constants.style.has(splitVariant[0]) ||
    constants.other.has(splitVariant[0])
  );
};

const isValidFormat = (str) => constants.format.has(str);

module.exports = {
  constants,
  isValidVariant,
  isValidFormat,
  mapWeight,
};
