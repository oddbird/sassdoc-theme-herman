(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search_results.j2"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<h1 class=\"search-heading\">\n  <span class=\"search-term\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "term"), env.opts.autoescape);
output += "</span>:\n  ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "count") || "No", env.opts.autoescape);
output += " results\n</h1>\n\n";
if(runtime.contextOrFrameLookup(context, frame, "count")) {
output += "\n  <ul class=\"js-search-results search-results\"></ul>\n";
;
}
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
