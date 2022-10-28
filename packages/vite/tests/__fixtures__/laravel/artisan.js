#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'

const command = process.argv.splice(2).join(' ')

if (command === 'php artisan navigare:config') {
  console.log(
    fs.readFileSync(
      path.resolve(import.meta.url.slice(7), '..', '..', 'configuration.json'),
      'utf-8',
    ),
  )
  process.exit(0)
}

if (command === 'php artisan navigare:routes') {
  console.log(
    fs.readFileSync(
      path.resolve(import.meta.url.slice(7), '..', '..', 'routes.json'),
      'utf-8',
    ),
  )
  process.exit(0)
}
process.exit(1)
