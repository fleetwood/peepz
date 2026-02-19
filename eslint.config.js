const tsParser = require('@typescript-eslint/parser')

module.exports = [
  {
    files  : ['**/*.{ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/distro/**',
    ],
    languageOptions: {
      parser       : tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType : 'module',
      },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[exportKind="type"]',
          message : 'Do not export types outside packages/types. Move shared types into packages/types and import barrel-only from @peeps/types.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group  : ['@peeps/types/*', '@peeps/types/**'],
              message: 'Use barrel-only imports from @peeps/types.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'apps/web/src/components/ui/**/*.{ts,tsx}',
      'apps/web/src/components/library/**/*.{ts,tsx}',
      'packages/types/**/*.{ts,tsx}',
      'packages/db/**/*.{ts,tsx}'
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]
