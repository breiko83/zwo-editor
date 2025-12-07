import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance'
import React from 'react';

// Initialize Bugsnag
Bugsnag.start({
  apiKey: process.env.REACT_APP_BUGSNAG_API_KEY || 'YOUR_BUGSNAG_API_KEY',
  plugins: [new BugsnagPluginReact()],
  enabledReleaseStages: ['production', 'staging'],
  releaseStage: process.env.NODE_ENV || 'development',
});
BugsnagPerformance.start({ apiKey: process.env.REACT_APP_BUGSNAG_API_KEY || 'YOUR_BUGSNAG_API_KEY' })

// Create the ErrorBoundary component
export const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

export default Bugsnag;
