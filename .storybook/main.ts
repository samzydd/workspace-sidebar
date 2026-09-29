import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
// The sibling design-system checkout. By default this Storybook renders the
// library's *source*, so unreleased component fixes show up immediately.
// `npm run storybook:npm` renders the published @sakaniui/react instead.
const DS = path.resolve(dir, '../../../sakani-design-system');
const useSource = process.env.SAKANI_DS !== 'npm';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    if (!useSource) return config;
    const existing = config.resolve?.alias;
    const rest = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({ find, replacement: String(replacement) }));
    config.resolve = {
      ...config.resolve,
      alias: [
        { find: /^@sakaniui\/react\/tokens\.css$/, replacement: `${DS}/src/styles/tokens.css` },
        { find: /^@sakaniui\/react\/style\.css$/, replacement: path.join(dir, 'empty.css') },
        { find: /^@sakaniui\/react$/, replacement: `${DS}/src/index.ts` },
        ...rest,
      ],
      // One React (and one lucide) for app + library source.
      dedupe: ['react', 'react-dom', 'lucide-react'],
    };
    config.server = {
      ...config.server,
      fs: { ...config.server?.fs, allow: [...(config.server?.fs?.allow ?? []), DS, path.resolve(dir, '..')] },
    };
    return config;
  },
};
export default config;
