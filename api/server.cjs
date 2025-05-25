const app = require('./index.cjs');

module.exports = (req, res) => {
  // This is necessary for Vercel serverless functions
  return app(req, res);
};
