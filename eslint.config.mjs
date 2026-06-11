import next from 'eslint-config-next'

const config = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'archive/**']
  },
  ...next,
  {
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  }
]

export default config
