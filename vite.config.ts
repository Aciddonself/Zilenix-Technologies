import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss()];
  if (mode === 'development') {
    try {
      // @ts-expect-error This local JavaScript helper does not provide a TypeScript declaration.
      const m = await import('./.vite-source-tags.js');
      plugins.push(m.sourceTags());
    } catch (error) {
      console.warn('The optional Vite source tags plugin could not be loaded.', error);
    }
  }

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    css: {
      postcss: { plugins: [] },
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
