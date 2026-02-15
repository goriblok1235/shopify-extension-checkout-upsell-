# Checkout Upsell Product Bundle – Shopify

This project implements a dynamic Checkout Upsell Product Bundle feature in Shopify, designed to increase Average Order Value (AOV) by offering complementary or discounted products during the checkout process.
The solution allows merchants to configure bundled products that can be displayed as upsell suggestions based on cart items. Customers can seamlessly add the suggested products to their cart with a single click before completing checkout.

Shopify apps are built on a variety of Shopify tools to create a great merchant experience. The [create an app](https://shopify.dev/docs/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app.

This app template does little more than install the CLI and scaffold a repository.

.

🚀 Key Features

Dynamic product bundle configuration

Conditional upsell logic based on cart contents

Discounted bundled pricing support

Seamless add-to-cart functionality

Responsive UI compatible with Shopify themes

Optimized for performance and user experience

🛠 Tech Stack

Shopify (Liquid)

JavaScript

Shopify AJAX API

CSS / Theme Customization

This implementation focuses on improving conversion rates while maintaining a smooth and intuitive checkout experience.

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

### Installing the template

This template can be installed using your preferred package manager:

Using yarn:

```shell
yarn create @shopify/app
```

Using npm:

```shell
npm init @shopify/app@latest
```

Using pnpm:

```shell
pnpm create @shopify/app@latest
```

This will clone the template and install the required dependencies.

#### Local Development

[The Shopify CLI](https://shopify.dev/docs/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables and runs commands in parallel.

You can develop locally using your preferred package manager. Run one of the following commands from the root of your app.

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development (such as generating extensions).

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App extensions](https://shopify.dev/docs/apps/build/app-extensions)
- [Extension only apps](https://shopify.dev/docs/apps/build/app-extensions/build-extension-only-app)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
