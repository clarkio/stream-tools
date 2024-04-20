import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://clarkio.com/',
  base: '/stream-tools/',
  integrations: [tailwind()]
});