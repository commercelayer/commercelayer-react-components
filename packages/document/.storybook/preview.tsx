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
