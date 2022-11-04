import { isDefined } from '@navigare/core'
import castArray from 'lodash.castarray'
import { Manifest, ManifestChunk, ModuleNode, ViteDevServer } from 'vite'

export const renderHead = (
  modules: Set<string>,
  manifest: Manifest,
  base: string,
): string[] => {
  const tags: string[] = []
  const visitedIds = new Set<string>()
  const visitedFiles = new Set<string>()

  for (const id of Array.from(modules)) {
    const chunk = manifest[id]

    if (!chunk) {
      continue
    }

    tags.push(
      ...renderHeadChunk(manifest, base, id, chunk, visitedIds, visitedFiles),
    )
  }

  return tags
}

export const renderHeadChunk = (
  manifest: Manifest,
  base: string,
  id: string,
  chunk: ManifestChunk,
  visitedIds: Set<string>,
  visitedFiles: Set<string>,
): string[] => {
  const tags: string[] = []

  if (visitedIds.has(id)) {
    return tags
  }

  // Remember that we already visited this module so we do not end in an infinite loop
  visitedIds.add(id)

  // Collect files plus styles
  const files = [
    ...castArray(chunk.file),
    ...castArray(chunk.css),
    // ...castArray(chunk.dynamicImports),
  ].filter(isDefined)

  // Go through files and render preload links
  for (const file of files) {
    if (visitedFiles.has(file)) {
      continue
    }

    visitedFiles.add(file)

    const preloadLink = generatePreloadLink(file, base)
    if (!preloadLink) {
      continue
    }

    tags.push(preloadLink)
  }

  // Collect dynamic imports
  const dynamicTags = castArray(chunk.dynamicImports)
    .filter(isDefined)
    .map((dynamicImportId) => {
      const dynamicImportChunk = manifest[dynamicImportId]

      return renderHeadChunk(
        manifest,
        base,
        dynamicImportId,
        dynamicImportChunk,
        visitedIds,
        visitedFiles,
      )
    })
    .flat()

  tags.push(...dynamicTags)

  return tags
}

export const generatePreloadLink = (
  _file: string,
  _base: string,
): string | undefined => {
  /*const finalFile = `${base}${file}`

  if (finalFile.endsWith('js') || finalFile.endsWith('.vue')) {
    return `<link rel="modulepreload" crossorigin href="${finalFile}">`
  }

  if (finalFile.endsWith('.css')) {
    return `<link rel="stylesheet" href="${finalFile}">`
  } else if (finalFile.endsWith('.woff')) {
    return ` <link rel="preload" href="${finalFile}" as="font" type="font/woff" crossorigin>`
  } else if (finalFile.endsWith('.woff2')) {
    return ` <link rel="preload" href="${finalFile}" as="font" type="font/woff2" crossorigin>`
  } else if (finalFile.endsWith('.gif')) {
    return ` <link rel="preload" href="${finalFile}" as="image" type="image/gif">`
  } else if (finalFile.endsWith('.jpg') || finalFile.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${finalFile}" as="image" type="image/jpeg">`
  } else if (finalFile.endsWith('.png')) {
    return ` <link rel="preload" href="${finalFile}" as="image" type="image/png">`
  }*/

  return undefined
}

export const getStylesFromFiles = async (
  vite: ViteDevServer | undefined,
  files: Set<string>,
): Promise<string> => {
  if (!vite) {
    return ''
  }

  const styles: string[] = []
  for (const file of files) {
    const modules = await getModulesByFile(vite, file)

    if (!modules) {
      continue
    }

    styles.push(...getStylesFromModules(modules))
  }

  return styles.join('\n\n')
}

export const getModulesByFile = async (
  vite: ViteDevServer,
  component: string,
) => {
  const filePath = '/Users/julian/Development/projects/empacity/' + component

  return await vite.moduleGraph.getModulesByFile(filePath)
}

export const getStylesFromModules = (modules: Set<ModuleNode>) => {
  const styles: string[] = []

  for (const module of modules) {
    if (
      !module.id?.endsWith('.css') &&
      !module.id?.includes('vue&type=style')
    ) {
      continue
    }

    styles.push(module.ssrModule?.default)
  }

  return styles
}
