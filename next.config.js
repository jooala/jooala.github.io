const path = require('path');

module.exports = {
  // Static export for GitHub Pages
  output: 'export',
  // Emit /work/frontier/index.html instead of /work/frontier.html so deep links
  // and folder-style URLs resolve on GitHub Pages without a server
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname),
};
