
# @democrance/imagemin-lint-staged
[![package version](https://img.shields.io/npm/v/@democrance/imagemin-lint-staged.svg?style=flat-square)](https://npmjs.org/package/@democrance/imagemin-lint-staged)
[![package downloads](https://img.shields.io/npm/dm/@democrance/imagemin-lint-staged.svg?style=flat-square)](https://npmjs.org/package/@democrance/imagemin-lint-staged)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
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
$ npm install -D @democrance/imagemin-lint-staged
```

You also need to install the default plugins unless you explicity want to override them:

```sh
$ npm install -D imagemin-gifsicle imagemin-mozjpeg imagemin-svgo imagemin-optipng
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

The package uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) with the module name `imagemin` to allow you to configure the [imagemin](https://github.com/imagemin) plugins. Add the following to your `package.json`

```json
{
  "imagemin": {
    "optipng": {
      "optimizationLevel": 5
    }
  }
}
```

Your configuration will be merged with the [default configuration](./default-conf.js). If you would like to remove one of the default plugins, add the value of `null` and it will be ignored.

```json
{
  "imagemin": {
    "optipng": null,
    "pngout": {}
  }
}
```

**Remember to install the imagemin plugins you use**. You'll get a warning if their is configuration, but the plugin is missing.

If you would like to get more details about the savings, add the `--verbose` flag to `lint-staged`.

## Contributing

Got an idea for a new feature? Found a bug? Contributions are welcome! Please [open up an issue](https://github.com/tiaanduplessis/@democrance/imagemin-lint-staged/issues) or [make a pull request](https://makeapullrequest.com/).

## License

[MIT © Daniil Chumachenko](./LICENSE)
    
