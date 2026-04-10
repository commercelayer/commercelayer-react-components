import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks"
import type { Parameters, Preview } from "@storybook/react-vite"
import React from "react"
import { worker } from "../mocks/browser"

export const parameters: Parameters = {
  layout: "centered",
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    options: {
      overlay: {
        name: "overlay",
        value: "#F8F8F8",
      },
    },
  },
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Getting Started",
        "Skus",
        // [
        //   "Welcome",
        //   "Applications",
        //   "Custom apps",
        //   "Token provider",
        //   "Core SDK provider",
        // ],
        // "Atoms",
        // "Forms",
        // ["react-hook-form"],
        // "Hooks",
        // "Lists",
        // "Composite",
        // "Resources",
        // "Examples",
      ],
    },
  },
  docs: {
    page: () => (
      <React.Fragment>
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <Controls />
        <Stories includePrimary={false} />
      </React.Fragment>
    ),
    // source: {
    //   transform: (input: string) =>
    //     prettier.format(input, {
    //       parser: 'babel',
    //       plugins: [prettierBabel]
    //     }),
    // },
  },
}

// export const withContainer: Decorator = (Story, context) => {
//   const { containerEnabled } = context.globals
//   if (containerEnabled === true) {
//     return (
//       <Container minHeight={false}>
//         <Story />
//       </Container>
//     )
//   }

//   return <Story />
// }

// export const withLocale: Decorator = (Story, context) => {
//   const locale = "en-US"
//   return (
//     <I18NProvider enforcedLocaleCode={locale}>
//       <Story />
//     </I18NProvider>
//   )
// }

// export const decorators: Decorator[] = [withLocale, withContainer]

// export const globals = {
//   [PARAM_KEY]: true,
// }

// Start MSW before any story renders — must be awaited via Storybook's beforeAll hook.
// Using beforeAll guarantees the service worker is registered before components mount
// and make their first API requests, avoiding the race condition of fire-and-forget start().
export const beforeAll = async (): Promise<void> => {
  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    quiet: true,
    // Bypass unhandled requests (e.g. auth calls to auth.commercelayer.io)
    // instead of warning — those intentionally hit the real network.
    onUnhandledRequest: "bypass",
  })
}

const argTypesEnhancers: Preview["argTypesEnhancers"] = [
  (context) => {
    // when the className prop comes from `JSX.IntrinsicElements['div' | 'span']`
    // and is not documented, we add a default description
    if (
      "className" in context.argTypes &&
      context.argTypes.className.description === ""
    ) {
      context.argTypes.className.description =
        "CSS class name for the base component"
    }

    return context.argTypes
  },
]

export default {
  parameters,
  argTypesEnhancers,
  tags: ["autodocs"],
}
