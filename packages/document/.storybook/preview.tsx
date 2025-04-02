import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/blocks"
import type { Decorator, Parameters } from "@storybook/react"
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
    values: [
      {
        name: "overlay",
        value: "#F8F8F8",
      },
    ],
  },
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Getting Started",
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

// Storybook executes this module in both bootstap phase (Node)
// and a story's runtime (browser). However, we cannot call `setupWorker`
// in Node environment, so need to check if we're in a browser.
if (typeof global.process === "undefined") {
  // Start the mocking when each story is loaded.
  // Repetitive calls to the `.start()` method do not register a new worker,
  // but check whether there's an existing once, reusing it, if so.
  worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    quiet: import.meta.env.PROD,
    onUnhandledRequest: !import.meta.env.PROD
      ? (req, reqPrint) => {
          const url = new URL(req.url)
          if (url.hostname === "mock.localhost") {
            reqPrint.warning()
          }
        }
      : () => {},
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
}
