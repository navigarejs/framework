import fs from 'fs'

const pathsToPatch = {
  'types/utilities.d.ts'(contents) {
    return contents
      .replaceAll(`Routable<never>`, 'Routable')
      .replaceAll(`PartialRoute<never>`, 'PartialRoute')
  },
}

for (const [path, patch] of Object.entries(pathsToPatch)) {
  const contents = await fs.promises.readFile(path, 'utf-8')
  await fs.promises.writeFile(path, patch(contents), 'utf-8')
}
