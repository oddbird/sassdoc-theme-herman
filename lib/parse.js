module.exports = {
  sassyJson: function (contents) {
    // Parse the contents of a file containing SassyJSON output and return as a
    // JS object.
    var startMarker = '/*! json-encode:';
    var endMarker = '*/';
    var start = contents.indexOf(startMarker);
    var jsondata = contents.slice(start + startMarker.length, -endMarker.length);
    return JSON.parse(jsondata);
  }
}
