const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

// Empty module to stub Node.js built-ins that don't exist in React Native
const emptyModule = require.resolve('./shims/empty.js');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    extraNodeModules: {
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      // Stub the rest — Supabase uses native WebSocket, not ws
      net: emptyModule,
      tls: emptyModule,
      fs: emptyModule,
      http: emptyModule,
      https: emptyModule,
      os: emptyModule,
      path: emptyModule,
    },
  },
});

module.exports = withNativeWind(config, {input: './global.css'});
