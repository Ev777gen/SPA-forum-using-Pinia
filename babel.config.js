module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],

  // Fixes "TypeError: require.context is not a function"
  // along with installing the pakage:
  // npm i -D babel-plugin-transform-require-context
  env: {
    test: {
      plugins: ['transform-require-context'],
    },
  },
}
