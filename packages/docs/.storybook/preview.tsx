/// <reference types="vite/client" />

import { PARAM_KEY } from './addon-container/constants'
import type { Decorator, Parameters } from '@storybook/react'
import { worker } from '../mocks/browser'

export const parameters: Parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'centered',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  // options: {
  //   storySort: {
  //     order: [
  //       'Getting Started',
  //       'Atoms',
  //       'Forms', ['react-hook-form'],
  //       'Hooks',
  //       'Lists',
  //       'Composite',
  //       'Resources',
  //       'Examples'
  //     ]
  //   }
  // },
  docs: {
    // source: {
    //   transform: (input: string) =>
    //     prettier.format(input, {
    //       parser: 'babel',
    //       plugins: [prettierBabel]
    //     }),
    // },
  },
}

export const withContainer: Decorator = (Story, context) => {
  const { containerEnabled } = context.globals

  if (containerEnabled === true) {
    return (
      <div className='container mx-auto  flex flex-col px-4 md:!px-0'>
        <Story />
      </div>
    )
  }

  return <Story />
}

export const decorators: Decorator[] = [
  withContainer
]

export const globals = {
  [PARAM_KEY]: true,
}

// Storybook executes this module in both bootstap phase (Node)
// and a story's runtime (browser). However, we cannot call `setupWorker`
// in Node environment, so need to check if we're in a browser.
if (typeof global.process === 'undefined') {
  // Start the mocking when each story is loaded.
  // Repetitive calls to the `.start()` method do not register a new worker,
  // but check whether there's an existing once, reusing it, if so.
  worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`
    },
    quiet: import.meta.env.PROD,
    onUnhandledRequest: !import.meta.env.PROD ? (req, reqPrint) => {
      if (req.url.hostname === 'mock.localhost') {
        reqPrint.warning()
      }
    } : () => {}
  })
}
