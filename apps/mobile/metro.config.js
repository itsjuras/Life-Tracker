const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so workspace packages resolve.
config.watchFolders = [workspaceRoot];

// Stop Metro from walking up directory trees when resolving imports.
// Without this, packages sitting in workspaceRoot/node_modules (e.g.
// @react-navigation/native) resolve their own deps (e.g. react-native-safe-
// area-context) from the root's node_modules, loading a different version
// than the Expo-pinned one in apps/mobile/node_modules and causing duplicate
// native module registration errors like RNCSafeAreaProvider.
config.resolver.disableHierarchicalLookup = true;

// With hierarchical lookup disabled, all resolutions go through these paths
// in order — project-level (Expo-pinned) packages win over workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// extraNodeModules takes highest priority — keeps project-level packages
// dominant for any direct top-level imports.
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (_, name) =>
      path.resolve(projectRoot, 'node_modules', String(name)),
  },
);

module.exports = withNativeWind(config, { input: './global.css' });
