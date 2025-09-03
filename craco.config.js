module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Handle .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      // Add .mjs to resolve extensions
      if (!webpackConfig.resolve.extensions.includes('.mjs')) {
        webpackConfig.resolve.extensions.push('.mjs');
      }

      // Handle fallback for Node.js modules (required for React Scripts 5.x)
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser"),
      };

      return webpackConfig;
    },
  },
};
