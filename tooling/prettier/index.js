/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  // tailwindStylesheet: fileURLToPath(new URL('./apps/web/src/style/index.css', import.meta.url)),
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  tailwindPreserveWhitespace: true,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  importOrder: [
    '<TYPES>',
    '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
    '^(next/(.*)$)|^(next$)',
    '^(expo(.*)$)|^(expo$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^@workspace',
    '^@workspace/(.*)$',
    '',
    '<TYPES>^[.|..|~]',
    '^~/',
    '^@/',
    '^#/',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  overrides: [
    {
      files: '*.json.hbs',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.ts.hbs',
      options: {
        parser: 'babel',
      },
    },
  ],
}

export default config
