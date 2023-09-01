# HumbleSwap UI

Application Interface for `HumbleSwap`.

## How do I use it?

1. Clone the project
2. `cd path/to/my-project`
3. `npm install`
4. `npm run start` (launches at `localhost:3000`)

**Note:** this project requires the Reach CLI for compiling `.rsh` files.\
Take a look at [Available Scripts](#available-scripts) for additional CLI commands.

---

## Available Scripts

### `npm start`

Runs the app in the development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder. This will run\

- `lingui extract`\
  Extract any translatable strings to a `src/locales/` folder
- `lingui compile`\
  Compile the extracted messages in `src/locales/` for production
- `react-scripts build`\
  Build the production bundle and output to `build/` in root\

---
# Development Practices

## File Naming Conventions

- Files and directories inside the `components` directory shold be capitalized.
- All other directories may be lowercased.
  - Lowercase files and directories should be hyphenated!
### Examples 

All examples are assumed to be in the `src/` root directory.

- **Components** 
  - [✅] `<MyComponent />` should be stored as `components/MyComponent.tsx`  
- **Component Directories** 
  - [✅] `components/MyComponent/index.tsx`
  - [❌] `components/my-component/index.tsx`
- **Non-component Utilities and helpers**
  - [✅] `utilities/index.tsx`
  - [✅] `utilities/some-helpers.tsx`
  - [✅] `helpers.tsx`
  - [❌] `utilities/NetworkHelpers.tsx`

---
## Lingui (i18n)

This project uses [LinguiJS](https://github.com/lingui/js-lingui) for internationalization.

### Usage Example

```jsx
// USE THIS! Lingui exports an identical but different item from @lingui/react,
import { Trans } from '@lingui/macro'

// Later in your JSX:
;<Trans>
  <p>This string needs a-translating</p>
</Trans>

// For strings that appear in other parts of code
import { t } from '@lingui/macro'

// Use `t` as a function
t`this doesn't appear in JSX, but it needs translation.`
```

Internationalization files are spawned into the `src/locales` folder: this folder is `git-ignored` to limit
excessive files during PRs.

---

## CryptoCurrency Icons
This project uses a [Cryptocurrency Icons](https://github.com/spothq/cryptocurrency-icons) package to render crypto icons. The contents of the package have been rolled into a custom ReactJS component, which can be used to render either an icon, or both an icon and the currency name. 

### Usage Example 
```jsx
import CryptoIcon from 'components/Common/CryptoIcon.tsx';

// In your JSX element:
<CryptoIcon
  color={true | false}
  symbol="ETH"
  iconOnly={true | false}
  size={20}
/>
```

### `<CryptoIcon />` Component Props
- `symbol: string`: 
  - **Required**: network abbreviation.\
  Used to find the required file (or a generic fallback) as a base64 image.
- `color?: boolean`
  - **Optional**: defaults to `false`.\
  When true, returns a color (instead of b/w) icon. 
- `iconOnly?: boolean`
  - **Optional**: defaults to `false`.\
  When true, returns just an `<img />` element with the icon. 
- `size?: number`
  - **Optional**: defaults to `20`(px).\
  Determines the size of the rendered `<img />` element. The implementation pulls from the `cryptocurrency-icons` SVG directory, so scaling should not lead to rasterization 

The **cryptocurrency-icons** package includes just over 450 cryptocurrency (along with less than 10 fiat) icons. The package developers have no intention to add any more fiat icons. 

### Crypto-icon Constants
There is a helper file in `constants/crypto-icons/ts` that is by the crypto-icon component to get images. You can import the following function from this file to use images in place of the component.
```typescript
function cryptoImage(symbol: string, color = false): string
```

---

## `Docusaurus` Documentation Site
The documentation site for this repository can be found [here](https://github.com/reach-sh/duoswap-docs)

---

## Git Policy and Workflow
1. Local/working branches should be named after the relevant ticket\
   **Example:** `JIRA-123`
2. When work is complete, create a PR to the `develop` branch
3. When PR is approved, **merge-squash** your changes into the `develop` branch
4. When `develop` branch has been updated, merge upwards in the following order:\
   i. **merge-squash** `develop -> staging (QA)`\
   ii. **merge-squash** `staging -> main (release/prod)`

CI/CD is handled using [AWS Amplify](https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/), so merging should deploy to the relevant environments.

## Deployment Environments
- [Dev](https://dev.deuxswap.com/)
- [Staging](https://stg.deuxswap.com/)
- [Production](https://deuxswap.com/)

---
# Technologies Used

[✅] [@reach-sh/stdlib](https://github.com/reach-sh/reach-lang)\
[✅] [ReactJS + Typescript](https://reactjs.org/docs/getting-started.html)\
[✅] [Styled Components](https://styled-components.com/docs/basics#installation)\
[✅] [Material Icons](https://developers.google.com/fonts/docs/material_icons#icon_font_for_the_web): - See issue with self-hosted fonts [here](https://github.com/google/material-design-icons/issues/594#issuecomment-899825837)\
[✅] [Cryptocurrency Icons](https://github.com/spothq/cryptocurrency-icons)\
[✅] [Jest](https://jestjs.io/docs/getting-started) (included in CRA): Component + unit testing\
[✅] [Lingui](https://github.com/lingui/js-lingui): Internationalization\
[✅] [Docusaurus](https://docusaurus.io/docs): Site documentation that runs in a standalone ReactJS single-page app (SPA). 

---

# Further ReactJS Resources

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
- [React documentation](https://reactjs.org/).
- [React deployment](https://facebook.github.io/create-react-app/docs/deployment)
- [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
- [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
- [Making a Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
- [Advanced Configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)
- [Deployment](https://facebook.github.io/create-react-app/docs/deployment)
- [`npm run build` fails to minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---
