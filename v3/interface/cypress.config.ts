import { defineConfig } from "cypress";

export default defineConfig({
  retries: {
    runMode: 1,
  },

  experimentalStudio: true,
  defaultCommandTimeout: 10000,
  video: true,
  screenshotOnRunFailure: false,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    excludeSpecPattern: ["**/template.spec.js"],
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});
