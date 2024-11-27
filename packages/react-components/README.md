# Commerce Layer React Components

A collection of reusable React components that makes it super fast and simple to build your own custom commerce UI, leveraging [Commerce Layer API](https://docs.commercelayer.io/api/).

### What is Commerce Layer?

[Commerce Layer](https://commercelayer.io) is a multi-market commerce API and order management system that lets you add global shopping capabilities to any website, mobile app, chatbot, wearable, voice, or IoT device, with ease. Compose your stack with the best-of-breed tools you already mastered and love. Make any experience shoppable, anywhere, through a blazing-fast, enterprise-grade, and secure API.

# Getting started

For a constantly updated list of the available and soon-to-come micro frontends provided by Commerce Layer's react componente, please refer to [this interactive documentation](https://commercelayer.github.io/commercelayer-react-components) that will provide you with all the necessary information about the involved web components and help you get started in a snap.

## Installation

Commerce Layer React Components are available as an [npm package](https://www.npmjs.com/package/@commercelayer/react-components):

```bash
// npm
npm install @commercelayer/react-components

// yarn
yarn add @commercelayer/react-components

// pnpm
pnpm add @commercelayer/react-components
```

## Authentication

All requests to Commerce Layer API must be authenticated with an [OAuth2](https://oauth.net/2/) bearer token. Hence, to use these components, you need to get a valid access token. Once you got it, you can pass it as prop — together with the endpoint of your Commerce Layer organization — to the `CommerceLayer` component, as follow:

```tsx
<CommerceLayer
  accessToken="your-access-token"
  endpoint="https://yourdomain.commercelayer.io">

  {/* ... child components */}

</CommerceLayer>
```

This token will be used to authorize the API calls of all its child components. That's why the presence of (at least) one `CommerceLayer` component is mandatory — it must wrap every other component you need to use.

> Please note that — in case you need to fetch data with different tokens (i.e. from different organizations or using apps with different roles and permissions) — nothing prevents you from putting as many `CommerceLayer` components you want in the same page.

You can check [our documentation](https://docs.commercelayer.io/api/authentication) for more information about the available authorization flows and leverage [Commerce Layer JS Auth](https://github.com/commercelayer/commercelayer-js-auth) to easily interact with our authentication API.

## Need help?

- Join [Commerce Layer's Discord community](https://discord.gg/commercelayer).
- Open a new [Q&A discussion](https://github.com/commercelayer/commercelayer-react-components/discussions/categories/q-a)
- Ping us on [Bluesky](https://bsky.app/profile/commercelayer.io), [X (formerly Twitter)](https://x.com/commercelayer), or [LinkedIn](https://www.linkedin.com/company/commerce-layer).
- Is there a bug? Create an [issue](https://github.com/commercelayer/commercelayer-react-components/issues) on this repository.

### License

This repository is published under the [MIT](LICENSE) license.
