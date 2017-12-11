'use strict';

/**
 * Override `@name` annotation to preserve the original name
 */
module.exports = () => ({
  name: 'name',
  multiple: false,
  parse: raw => raw.trim(),
  // Abuse the autofill feature to rewrite the `item.context`
  autofill: item => {
    if (item.name) {
      item.context.origName = item.context.name;
      item.context.name = item.name;
      // Cleanup
      delete item.name;
    }
  },
});
