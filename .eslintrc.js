module.exports = {
    "extends": ["eslint:recommended", "google"],
    "parserOptions":
      {
        "ecmaVersion": 6,
        "sourceType": "module"
      },
    "env":
      { "browser": false,
        "es6": true,
        "node": true,
        "mocha": true
      },
    "rules":
      {
        "no-multi-str": "off" // not a problem in node apps
      }
};
