const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const pak = require('../package.json');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');
const appNodeModules = path.resolve(projectRoot, 'node_modules');

const peerNames = Object.keys(pak.peerDependencies || {});
const peerRootBlockList = peerNames.map(
  (name) =>
    new RegExp(
      `^${escape(path.join(repoRoot, 'node_modules', name))}\\/.*$`,
    ),
);

const extraNodeModules = peerNames.reduce((acc, name) => {
  acc[name] = path.join(appNodeModules, name);
  return acc;
}, {});
extraNodeModules['vibes-react-native'] = repoRoot;

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  projectRoot,
  watchFolders: [repoRoot],
  resolver: {
    blockList: exclusionList(peerRootBlockList),
    extraNodeModules,
  },
});
