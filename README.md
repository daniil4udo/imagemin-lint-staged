
# @democrance/imagemin-lint-staged
[![package version](https://img.shields.io/npm/v/@democrance/imagemin-lint-staged.svg?style=flat-square)](https://npmjs.org/package/@democrance/imagemin-lint-staged)
[![package downloads](https://img.shields.io/npm/dm/@democrance/imagemin-lint-staged.svg?style=flat-square)](https://npmjs.org/package/@democrance/imagemin-lint-staged)
[![package license](https://img.shields.io/npm/l/@democrance/imagemin-lint-staged.svg?style=flat-square)](https://npmjs.org/package/@democrance/imagemin-lint-staged)

Easily configure [imagemin](https://github.com/imagemin) to work with [lint-staged](https://github.com/okonet/lint-staged)


## Table of Contents
- [@democrance/imagemin-lint-staged](#democranceimagemin-lint-staged)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Install

Install the package locally within you project folder with your package manager:

```sh
$ pnpm install -D @democrance/imagemin-lint-staged
```

## Usage

Configure with [lint-staged](https://github.com/okonet/lint-staged):

```json
{
    "lint-staged": {
        "*.{png,jpeg,jpg,gif,svg}": ["imagemin-lint-staged"]
    }
}
```

The package uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) with the module name `imagemin` to allow you to configure the [sharp](https://sharp.pixelplumbing.com/api-output#toformat) and [SVGO](https://github.com/svg/svgo?tab=readme-ov-file#configuration) plugins. Add the following to your `package.json`

```json
{
    "imagemin": {
        // Configuration for Sharp image optimization
        "$sharp": {
            "progressive": true,
            "quality": 90,
            "nearLossless": true,
            "effort": 6,
            "compressionLevel": 9,
            "force": false
            // Add additional Sharp configurations here...
        },

        // Configuration for SVGO optimization
        "$svgo": {
            "multipass": true
            // Add additional SVGO configurations here...
        },

        // Library defaults

        // Minimum difference between minified & original files to trigger saving
        "skipDelta": 500,

        // Ignore errors during minification process
        "silentErrors": false,

        // Print information about saved bytes
        "showSavings": true
    }
}
```

Your configuration will be merged with the [default configuration](./default-conf.js). 

If you would like to get more details about the savings, add the `--verbose` flag to `lint-staged`.

## Contributing

Got an idea for a new feature? Found a bug? Contributions are welcome! Please [open up an issue](https://github.com/daniil4udo/imagemin-lint-staged) or [make a pull request](https://makeapullrequest.com/).

## License

[MIT © Daniil Chumachenko](./LICENSE)
    
