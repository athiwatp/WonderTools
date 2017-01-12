'use strict';

const path = require('path');
const jetpack = require('fs-jetpack');
const rollup = require('rollup').rollup;

const nodeBuiltInModules = [ 'assert', 'buffer', 'child_process', 'cluster',
'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib' ];

const electronBuiltInModules = [ 'electron' ];

const npmModulesUsedInApp = () => {
  const appManifest = require('../app/package.json');
  return Object.keys(appManifest.dependencies);
};

const generateExternalModulesList = () => {
  return [].concat(nodeBuiltInModules, electronBuiltInModules, npmModulesUsedInApp());
};

const cached = {};

module.exports = (src, dest) => {
  return rollup({
    entry: src,
    external: generateExternalModulesList(),
    cache: cached[src],
  })
  .then(function (bundle) {
    cached[src] = bundle;

    const jsFile = path.basename(dest);
    const result = bundle.generate({
      format: 'cjs',
      sourceMap: true,
      sourceMapFile: jsFile,
    });

    const isolatedCode = '(function () {' + result.code + '\n}());';
    return Promise.all([
      jetpack.writeAsync(dest, isolatedCode + '\n//# sourceMappingURL=' + jsFile + '.map'),
      jetpack.writeAsync(dest + '.map', result.map.toString()),
    ]);
  });
};
