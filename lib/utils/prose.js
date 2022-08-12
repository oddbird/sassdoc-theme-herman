'use strict';

// Consider it to be prose if it's separated from the next Sass block
// by any blank lines.
const isProse = (item) => {
  if (item?.context?.line && item?.commentRange) {
    const itemName = item.context.origName || item.context.name || '';
    const lineCount = itemName.split('\n').length;
    if (
      !itemName ||
      item.context.line.start > item.commentRange.end + lineCount
    ) {
      return true;
    }
  }
  return false;
};

module.exports = { isProse };
