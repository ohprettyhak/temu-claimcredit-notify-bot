import { config } from '@hakui/eslint-config/base';

/** @type {import('eslint').Linter.Config} */
export default [...config, { rules: { 'no-console': 'off' } }];
