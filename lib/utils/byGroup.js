'use strict';

module.exports = (data, orderedGroups) => {
  const dataByGroup = {};
  data.forEach((item) => {
    const group = item.group[0].toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(dataByGroup, group)) {
      dataByGroup[group] = [];
    }
    dataByGroup[group].push(item);
  });
  // Sort results by order groups were defined
  const sorted = {};
  for (const group of orderedGroups) {
    if (typeof group === 'string') {
      if (Object.prototype.hasOwnProperty.call(dataByGroup, group)) {
        sorted[group] = dataByGroup[group];
      }
    } else {
      for (const subgroup of group.subgroups) {
        if (Object.prototype.hasOwnProperty.call(dataByGroup, subgroup)) {
          sorted[subgroup] = dataByGroup[subgroup];
        }
      }
    }
  }
  return sorted;
};
