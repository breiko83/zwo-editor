const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/Users/carloschiesaro/work/zwo-generator/.cache/dev-404-page.js"))),
  "component---src-pages-app-js": hot(preferDefault(require("/Users/carloschiesaro/work/zwo-generator/src/pages/app.js"))),
  "component---src-pages-index-tsx": hot(preferDefault(require("/Users/carloschiesaro/work/zwo-generator/src/pages/index.tsx")))
}

