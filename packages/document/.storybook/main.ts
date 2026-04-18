import { resolve } from "node:path"
import type { StorybookConfig } from "@storybook/react-vite"
import remarkGfm from "remark-gfm"
import { mergeConfig, type UserConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

const rcRoot = resolve(import.meta.dirname, "../../react-components")
const rcSrc = `${rcRoot}/src`

const viteOverrides: UserConfig = {
  base: process.env.VITE_BASE_URL,
  resolve: {
    alias: {
      "@commercelayer/react-components": `${rcSrc}/index.ts`,
      "#components": `${rcSrc}/components`,
      "#components-utils": `${rcSrc}/components/utils`,
      "#context": `${rcSrc}/context`,
      "#hooks": `${rcSrc}/hooks`,
      "#typings": `${rcSrc}/typings`,
      "#utils": `${rcSrc}/utils`,
      "#config": `${rcSrc}/config`,
      "#reducers": `${rcSrc}/reducers`,
    },
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tsconfigPaths({
      projects: [
        resolve(rcRoot, "tsconfig.json"),
        resolve(import.meta.dirname, "../tsconfig.json"),
      ],
    }),
  ],
}

const storybookConfig: StorybookConfig = {
  async viteFinal(config) {
    return mergeConfig(config, viteOverrides)
  },
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  // @ts-expect-error This 'managerEntries' exists.
  managerEntries: [
    resolve(import.meta.dirname, "./addon-gh-repository/manager.tsx"),
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  docs: {
    docsMode: true,
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: resolve(import.meta.dirname, "../tsconfig.app.json"),
      propFilter: (prop) => {
        if (["children", "className"].includes(prop.name)) {
          return true
        }

        if (prop.parent != null) {
          return (
            !prop.parent.fileName.includes("@types/react") &&
            !prop.parent.fileName.includes("@emotion")
          )
        }
        return true
      },
    },
  },
}

export default storybookConfig
