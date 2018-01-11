'use strict';

module.exports = (groups, logger) => {
  const normalizedGroups = {};
  for (const group of Object.keys(groups)) {
    if (typeof groups[group] === 'string') {
      normalizedGroups[group] = groups[group];
    } else {
      for (const subgroup of Object.keys(groups[group])) {
        if (normalizedGroups.hasOwnProperty(subgroup)) {
          logger.warn(`Group slugs must be unique: "${subgroup}"`);
        } else {
          normalizedGroups[subgroup] = groups[group][subgroup];
        }
      }
    }
  }
  return normalizedGroups;
};
