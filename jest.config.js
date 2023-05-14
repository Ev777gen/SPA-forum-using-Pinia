module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  
  // Fixes "Jest encountered an unexpected token"
  transformIgnorePatterns: [
    '/node_modules/(?!(@hennge/vue3-pagination)/)',
  ]
}
