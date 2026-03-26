# Zwift Workout Editor

A browser-based tool to create, edit, and export `.zwo` workout files for Zwift — no Zwift installation required. Supports both bike and run workouts with a visual drag-and-drop editor and a text-based editor.

**Live at [zwiftworkout.com](https://www.zwiftworkout.com/)**

[![Netlify Status](https://api.netlify.com/api/v1/badges/0379dca2-6a91-4d51-af55-ea3fa0489520/deploy-status)](https://app.netlify.com/sites/zwiftworkout/deploys)

## Features

- Visual drag-and-drop workout builder
- Text-based workout editor
- Bike and run workout support (time or distance based)
- Segment types: steady state, ramp (warmup/cooldown), intervals, free ride
- Power zones, cadence, and incline controls
- Text events / instructions on segments
- Export to `.zwo` file

## Getting Started

```bash
npm install
npm start       # Dev server at http://localhost:3000
npm run build   # Production build → /build
npm test        # Run tests
```

## Tech Stack

- React 16 + TypeScript
- React Router DOM 5

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push the branch (`git push origin my-new-feature`)
5. Open a Pull Request

## Support

Open a ticket via [GitHub Issues](https://github.com/breiko83/zwo-editor/issues).
