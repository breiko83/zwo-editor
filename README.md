# Zwift Workout Editor

Zwift Workout editor is a web based tool to edit ZWO files (Zwift workouts). It's developed in React. 

[Website](https://www.zwiftworkout.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/0379dca2-6a91-4d51-af55-ea3fa0489520/deploy-status)](https://app.netlify.com/sites/zwiftworkout/deploys)

## Changelog

### V1.9 (16/02/2021)
- [feature] Added speed label for running workouts
- [feature] New text instruction editor

### V1.8 (31/12/2020)
- [feature] New workout text editor! For everyone who love typing!

### V1.7 (28/12/2020)
- [bugfix] Added missing cadence values to intervals and free ride
- [bugfix] Moved cadence input field next to segment
- [bugfix] Minor fixes and refactoring

### V1.6 (14/11/2020)
- [feature] You can now create workouts as long as 43 Km / 6 hours
- [bugfix] Fixed an issue with duplicating length based segments

### V1.5 (12/11/2020)
- [bugfix] Replaced time picker for browser and multiple locale compatibility
- [bugfix] Fixed layout issue with Text Events

### V1.4 (28/10/2020)
- [feature] Added Workout Duration Type for Running Workouts (specify a workout in time or distance)
- [bugfix] Fixed issue with total workout distance / total workout time

### V1.3 (28/10/2020)
- [feature] Added Run Workout creator

### V1.2 (6/10/2020)

- [feature] Added intervals (beta)

### V1.1 (5/10/2020)

- [feature] Add tags to your workout
- [feature] Delete a segment via keyboard backspace
- [feature] Resize a segment via keyboard arrows (◀️ reduce time, ▶️ add time, 🔼 add power, ⬇️ reduce power) 
- [feature] Showing %ftp range on warmup / cooldown
- [feature] Moved total workout time and TSS to top right screen
- [bugfix] Duplicating segments also copy cadance value
- [bugfix] Warmup / Cooldown default values set to 25%-75% FTP 

### V1.0 (1/10/2020)

Initial Release


## Support

Click [Issues](https://github.com/breiko83/zwo-editor/issues) to open a support ticket 

## Installation

    $ yarn

## Usage

    $ yarn start

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
