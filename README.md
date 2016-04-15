[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

[Express'](https://www.npmjs.com/package/express) application generator.

## Installation

```sh
$ npm install -g express-generator-api
```

## Quick Start
Fork of the crufty [express generator](https://github.com/expressjs/generator) that scaffolds a basic json api that listens at /users
The quickest way to get started with express is to utilize the executable `express-api` to generate an application as shown below:

Create the app:

```bash
$ express-api /tmp/foo && cd /tmp/foo
```

Install dependencies:

```bash
$ npm install
```

Rock and Roll

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

    -h, --help          output usage information
    -V, --version       output the version number
        --git           add .gitignore
    -f, --force         force on non-empty directory

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express-generator.svg
[npm-url]: https://npmjs.org/package/express-generator
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/generator
[downloads-image]: https://img.shields.io/npm/dm/express-generator.svg
[downloads-url]: https://npmjs.org/package/express-generator
