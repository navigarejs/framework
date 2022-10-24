#!/usr/bin/env node

import { serve } from './../build/index.esm.js'
import path from 'node:path'
;(async () => {
  const input = process.argv[2]
  const finalInput = input ? path.join(process.cwd(), input) : undefined

  const { printUrls } = await serve({
    input: finalInput,
    logger: {
      info: (message) => {
        console.info(message)
      },
      warn: (message) => {
        console.warn(message)
      },
      warnOnce: (message) => {
        console.warn(message)
      },
      error: (message) => {
        console.error(message)
      },
    },
  })

  printUrls()
})()
