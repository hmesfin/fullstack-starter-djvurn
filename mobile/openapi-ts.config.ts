import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-axios',
  input: 'http://localhost:8000/api/schema/',
  output: {
    format: 'prettier',
    path: './src/api',
  },
  types: {
    enums: 'javascript',
  },
});
