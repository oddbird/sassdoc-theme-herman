'use strict';

module.exports = (data, orderedGroups) => {
  const dataByGroup = {};
  data.forEach(item => {
    const group = item.group[0];
    if (!dataByGroup.hasOwnProperty(group)) {
      dataByGroup[group] = [];
    }
    dataByGroup[group].push(item);
  });
  // Sort results by order groups were defined
  const sorted = {};
  for (const group of Object.keys(orderedGroups)) {
    if (dataByGroup.hasOwnProperty(group)) {
      sorted[group] = dataByGroup[group];
    }
  }
  return sorted;
};
