module.exports = {
  // The list of files to lint.
  "components/**/*.js": ["npx prettier --write"],
  "middleware.js": ["npx prettier --write", "npx eslint"],
  "services/**/*.js": ["npx prettier --write"],
  "hooks/**/*.js": ["npx prettier --write", "npx eslint"],
  "pages/**/*.js": ["npx prettier --write", "npx eslint"],
  "store/**/*.js": ["npx prettier --write", "npx eslint"],
  "environments/*/+(config|.i18n)/*.js": ["npx prettier --write", "npx eslint"],
};
