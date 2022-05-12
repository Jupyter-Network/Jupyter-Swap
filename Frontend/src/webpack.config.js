module.exports = {
  resolve: {
    fallback: {  "crypto": require.resolve("crypto-browserify"),os: require.resolve("os-browserify/browser") },
  },
};
