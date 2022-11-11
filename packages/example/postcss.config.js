/* eslint-env node */

/** @typedef { import('postcss').Plugin } Plugin */
/** @typedef { import('postcss').ProcessOptions } ProcessOptions */
/** @typedef { import('postcss').Plugin } Plugin */

const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const tailwindcssNesting = require('tailwindcss/nesting/index.js')

/** @type ProcessOptions & { plugins?: PostCSS.Plugin[]; }) */
const config = {
  plugins: [tailwindcssNesting, tailwindcss, autoprefixer],
}

module.exports = config
