const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');
const nodeLibs = require('node-libs-react-native');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      // Override with empty shim for modules that have no RN equivalent
      net: require.resolve('./shims/empty.js'),
      tls: require.resolve('./shims/empty.js'),
      fs: require.resolve('./shims/empty.js'),
      http: require.resolve('./shims/empty.js'),
      https: require.resolve('./shims/empty.js'),
    },
  },
});

module.exports = withNativeWind(config, {input: './global.css'});
