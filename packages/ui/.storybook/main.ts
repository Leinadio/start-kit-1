import path from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"
import tsconfigPaths from "vite-tsconfig-paths"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    config.plugins ??= []
    config.plugins.push(tsconfigPaths())
    config.resolve ??= {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "next/navigation": path.resolve(dirname, "next-navigation-mock.ts"),
      "next/link": path.resolve(dirname, "next-link-mock.tsx"),
    }
    return config
  },
}
export default config
