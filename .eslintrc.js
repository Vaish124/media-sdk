module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['import'],
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          // media-core: no React, no wrappers, no UI packages
          target: './packages/media-core/src',
          from: [
            './node_modules/react',
            './node_modules/react-native',
            './packages/media-react/src',
            './packages/media-ui-react/src',
          ],
          message: 'media-core must be framework-agnostic.'
        },
        {
          // media-ui-react: no core, no wrappers (headless = data-agnostic)
          target: './packages/media-ui-react/src',
          from: [
            './packages/media-core/src',
            './packages/media-react/src',
            './packages/media-native/src',
          ],
          message: 'media-ui-react must not import from core or wrappers.'
        },
        {
          // media-ui-native: same rule
          target: './packages/media-ui-native/src',
          from: [
            './packages/media-core/src',
            './packages/media-react/src',
            './packages/media-native/src',
          ],
          message: 'media-ui-native must not import from core or wrappers.'
        },
        {
          // media-react: must not import UI packages
          target: './packages/media-react/src',
          from: [
            './packages/media-ui-react/src',
            './packages/media-ui-native/src',
          ],
          message: 'media-react must not import UI packages.'
        },
      ]
    }]
  }
}
