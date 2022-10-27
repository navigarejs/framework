import { safeParse } from '@navigare/core'
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

export function getVersion(name: string = '@navigare/cli') {
  try {
    const pkg = safeParse<{ version: string }>(
      fs.readFileSync(
        path.join(require.resolve(name), '..', '..', 'package.json'),
        'utf-8',
      ),
    )

    return pkg?.version || 'n/a'
  } catch (error) {
    console.log(error)
    return 'n/a'
  }
}
