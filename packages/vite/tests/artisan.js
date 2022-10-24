#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('node:path')
const fs = require('node:fs')
const command = process.argv.splice(2).join(' ')

if (command === 'php artisan navigare:config') {
  printJson(
    fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/configuration.json'),
      { encoding: 'utf-8' },
    ),
  )
  process.exit(0)
}

if (command === 'php artisan navigare:routes') {
  printJson(
    fs.readFileSync(path.resolve(__dirname, '__fixtures__/routes.json'), {
      encoding: 'utf-8',
    }),
  )
  process.exit(0)
}

function printJson(print) {
  process.stdout.write(print)
}

process.exit(1)
