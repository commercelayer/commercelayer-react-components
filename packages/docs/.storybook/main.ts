import { dirname, join, resolve } from "node:path"
import type { StorybookConfig } from '@storybook/react-vite'
import remarkGfm from "remark-gfm"
import { mergeConfig, type UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const viteOverrides: UserConfig = {
  base: process.env.VITE_BASE_URL,
  plugins: [
    tsconfigPaths({
      projects: [
        resolve(__dirname, '../../react-components/tsconfig.json'),
        resolve(__dirname, '../tsconfig.json')
      ]
    })
  ]
}

const storybookConfig: StorybookConfig = {
  async viteFinal(config) {
    return mergeConfig(config, viteOverrides)
  },
  staticDirs: ["../public"],
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    getAbsolutePath("@storybook/addon-styling-webpack"),
  ],
  // @ts-expect-error This 'managerEntries' exists.
  managerEntries: [
    require.resolve("./addon-container/manager.tsx"),
    require.resolve("./addon-version/manager.tsx"),
    require.resolve("./addon-gh-repository/manager.tsx"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {}
  },
  core: {
    disableTelemetry: true
  },
  docs: {
    docsMode: true
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      propFilter: (prop) => {
        if (['children', 'className'].includes(prop.name)) {
          return true
        }

        if (prop.parent != null) {
          return (
            !prop.parent.fileName.includes('@types/react') &&
            !prop.parent.fileName.includes('@emotion')
          )
        }
        return true
      }
    }
  }
}

export default storybookConfig

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")))
}