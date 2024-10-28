import js from '@eslint/js';
import globals from 'globals';

import * as parserTs from '@typescript-eslint/parser';
import parserBabel from '@babel/eslint-parser';

import tseslint from 'typescript-eslint';

import pluginImportX from 'eslint-plugin-import-x';

import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import configPrettier from 'eslint-config-prettier';

import pluginVue from 'eslint-plugin-vue';

const isProd = process.env.NODE_ENV === 'production';
const runInProd = (config) => (!isProd ? 'off' : config);

const rulesJs = {
  ...js.configs.recommended.rules,
  ...configPrettier.rules,
};
const rulesTs = {
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-dynamic-delete': 'warn',
};

const localConfigIgnores = {
  ignores: ['node_modules', '.vscode', 'package-lock.json', 'dist', 'dist-electron', 'release', '.eslintcache'],
};

const localConfigImport = {
  files: ['**/*.js', 'src/**/*.ts', 'vite.config.ts'],
  plugins: {
    'import-x': pluginImportX,
  },
  rules: {
    ...pluginImportX.configs.recommended.rules,
    'import-x/export': 'error',
    'import-x/first': 'off',
    'import-x/extensions': 'off',
    'import-x/no-self-import': 'error',
    'import-x/no-unresolved': 'error',
    'import-x/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true,
      },
    ],
    'import-x/order': 'off',
    'import-x/no-cycle': runInProd('error'),
    'import-x/no-deprecated': runInProd('warn'),
    'import-x/no-unused-modules': runInProd('error'),
    'import-x/no-named-as-default': runInProd('error'),
  },
};

const localConfigJsNode = [
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
      parser: parserBabel,
    },
    settings: {
      'prettier/prettier': 'error',
      'import-x/parsers': {
        '@babel/eslint-parser': ['**/*.js'],
      },
    },
    rules: {
      ...rulesJs,
    },
  },
];

const localConfigJs = {
  files: ['**/*.js'],
  ignores: localConfigJsNode[0].files,
  plugins: {},
  languageOptions: {
    ecmaVersion: 'latest',
    globals: {
      ...globals.builtin,
      ...globals.browser,
    },
    parser: parserBabel,
  },
  settings: {
    'prettier/prettier': 'error',
    'import-x/parsers': {
      '@babel/eslint-parser': ['**/*.js'],
    },
  },
  rules: {
    ...rulesJs,
  },
};

const localConfigTs = [
  ...tseslint.configs.strict,
  pluginImportX.configs.typescript,
  {
    files: ['**/*.ts'],
    ignores: ['vite.config.ts'],
    plugins: {},
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.browser,
      },
    },
    settings: {
      'prettier/prettier': 'error',
      'import-x/resolver': {
        typescript: {
          project: ['./tsconfig.app.json'],
        },
      },
    },
    rules: {
      ...rulesTs,
    },
  },
];

const localConfigTsNode = [
  {
    files: ['vite.config.ts', 'vite.base.config.ts', 'vite.test.config.ts', 'scripts/**/*.ts', 'cypress.config.ts'],
    plugins: {},
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
    },
    settings: {
      'prettier/prettier': 'error',
      'import-x/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
      },
    },
    rules: {
      ...rulesTs,
    },
  },
];

const localConfigVue = [
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        parser: {
          ts: parserTs,
          js: parserBabel,
        },
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
      },
    },
    rules: {
      ...rulesTs,

      'vue/html-indent': [
        'error',
        2,
        {
          attribute: 1,
          baseIndent: 1,
          closeBracket: 0,
          alignAttributesVertically: true,
        },
      ],
      'vue/html-self-closing': 0,
      'vue/no-multiple-template-root': 'off',
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/no-v-for-template-key': 0,
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: {
            max: 1,
          },
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
        },
      ],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/mustache-interpolation-spacing': ['error', 'always'],
      'vue/no-v-model-argument': 0,
      'vue/v-on-event-hyphenation': ['error', 'never'],
      'vue/block-order': [
        'error',
        {
          order: ['script:not([setup])', 'script[setup]', 'template', 'style'],
        },
      ],
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      'vue/prefer-define-options': 'error',
    },
  },
];

export default tseslint.config(
  localConfigIgnores,
  pluginPrettierRecommended,
  localConfigImport,
  localConfigJs,
  ...localConfigJsNode,
  ...localConfigTs,
  ...localConfigTsNode,
  ...localConfigVue,
);
