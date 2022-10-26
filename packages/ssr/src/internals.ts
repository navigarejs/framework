import { safeParse } from '@navigare/core'
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

export function getVersion() {
  const pkg = safeParse<{ version: string }>(
    fs.readFileSync(
      path.join(require.resolve('@navigare/ssr'), '..', '..', 'package.json'),
      'utf-8',
    ),
  )

  return pkg?.version || 'n/a'
}

export function getCoreVersion() {
  const pkg = safeParse<{ version: string }>(
    fs.readFileSync(
      path.join(require.resolve('@navigare/core'), '..', '..', 'package.json'),
      'utf-8',
    ),
  )

  return pkg?.version || 'n/a'
}
