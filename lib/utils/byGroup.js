'use strict';

module.exports = (data, orderedGroups) => {
  const dataByGroup = {};
  data.forEach(item => {
    const group = item.group[0].toLowerCase();
    if (!dataByGroup.hasOwnProperty(group)) {
      dataByGroup[group] = [];
    }
    dataByGroup[group].push(item);
  });
  // Sort results by order groups were defined
  const sorted = {};
  for (const group of orderedGroups) {
    if (typeof group === 'string') {
      if (dataByGroup.hasOwnProperty(group)) {
        sorted[group] = dataByGroup[group];
      }
    } else {
      for (const subgroup of group.subgroups) {
        if (dataByGroup.hasOwnProperty(subgroup)) {
          sorted[subgroup] = dataByGroup[subgroup];
        }
      }
    }
  }
  return sorted;
};
