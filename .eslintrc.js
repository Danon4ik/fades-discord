module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 12,
    parser: "babel-eslint"
  },
  extends: [],
  plugins: [],
  rules: {
    "semi": [2, "always"],
    "curly": "off",
    "no-console": "off",
    "require-await": "off",
    "import/order": "off",
    "quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "quote-props": "off",
    "arrow-parens": "off",
    "space-before-function-paren": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/max-attributes-per-line": "off"
  }
};