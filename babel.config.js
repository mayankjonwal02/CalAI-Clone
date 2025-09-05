module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Removed react-native-worklets/plugin as it conflicts with react-native-reanimated
    ],
  };
};


