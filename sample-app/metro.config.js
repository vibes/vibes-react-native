const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const pak = require('../package.json');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');
const appNodeModules = path.resolve(projectRoot, 'node_modules');

/** Peer deps of the library: resolve from the example app, not the repo root. */
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

/**
 * Must extend `@react-native/metro-config` so `transformer.assetRegistryPath` (and the
 * RN Babel transformer) are set. A plain `transformer: { getTransformOptions }` object
 * replaces the whole transformer and restores Metro’s placeholder
 * `missing-asset-registry-path`, which breaks image assets (e.g. React Navigation icons).
 */
module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  projectRoot,
  watchFolders: [repoRoot],
  resolver: {
    blockList: exclusionList(peerRootBlockList),
    extraNodeModules,
  },
});
