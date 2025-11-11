const isProd = process.env.NODE_ENV === 'production';
const path = require('path');

module.exports = {
  assetPrefix: isProd ? '/' : '',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname),
};
