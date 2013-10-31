[![Build Status](https://secure.travis-ci.org/joelpurra/bespoke-logbook.png?branch=master)](https://travis-ci.org/joelpurra/bespoke-logbook)

# bespoke-logbook

Log bespoke events and state to the console

## Download

Download the [production version][min] or the [development version][max], or use a [package manager](#package-managers).

[min]: https://raw.github.com/joelpurra/bespoke-logbook/master/dist/bespoke-logbook.min.js
[max]: https://raw.github.com/joelpurra/bespoke-logbook/master/dist/bespoke-logbook.js

## Usage

First, include both `bespoke.js` and `bespoke-logbook.js` in your page.

Then, simply include the plugin when instantiating your presentation.

```js
bespoke.horizontal.from('article', {
  logbook: true
});
```

## Package managers

### Bower

```bash
$ bower install bespoke-logbook
```

### npm

```bash
$ npm install bespoke-logbook
```

The bespoke-logbook npm package is designed for use with [browserify](http://browserify.org/), e.g.

```js
require('bespoke');
require('bespoke-logbook');
```

## Credits

This plugin was built with [generator-bespokeplugin](https://github.com/markdalgleish/generator-bespokeplugin).

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
