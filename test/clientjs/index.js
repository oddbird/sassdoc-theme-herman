import './utils';

// require all test modules
const testsContext = require.context('./', false, /test_.*\.js$/);
testsContext.keys().forEach(testsContext);

// require all source js modules (to ensure full code coverage)
const srcContext = require.context(
  './../../assets/js/',
  false,
  /^(?!.\/init).*\.js$/
);
srcContext.keys().forEach(srcContext);
