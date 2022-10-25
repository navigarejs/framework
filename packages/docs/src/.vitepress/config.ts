import { defineConfig } from 'vitepress'
import path from 'node:path'
import fs from 'node:fs'

const isCI = !!process.env.CI

const color = '#FC5C7D'

const github = 'jaulz/navigare'

const twitter = 'jaulz'

const logo =
  'https://raw.githubusercontent.com/jaulz/navigare/main/assets/logo.svg'

const pkg = JSON.parse(
  fs.readFileSync(path.resolve('../../package.json'), 'utf-8'),
) as {
  name: string
  description: string
  homepage: string
  version: string
}

export default async function () {
  return defineConfig({
    title: pkg.name,

    description: pkg.description,

    appearance: true,

    lastUpdated: true,

    base: isCI ? '/navigare' : undefined,

    head: [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: pkg.name }],
      ['meta', { property: 'og:description', content: pkg.description }],
      ['meta', { property: 'og:url', content: pkg.homepage }],
      ['meta', { property: 'og:image', content: logo }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:site', content: `@${twitter}` }],
      ['meta', { name: 'theme-color', content: color }],
      ['link', { rel: 'icon', type: 'image/svg+xml', href: logo }],
    ],

    themeConfig: {
      logo,

      footer: {
        copyright:
          'Made by <a class="underline" href="https://twitter.com/jaulz">Julian Hundeloh</a>',
        message:
          'Released under the <a href="https://github.com/jaulz/navigare/blob/main/LICENSE">MIT License</a>.',
      },

      editLink: {
        repo: github,
        branch: 'main',
        dir: 'packages/docs',
        text: 'Suggest changes to this page',
      },

      socialLinks: [
        { icon: 'twitter', link: `https://twitter.com/${twitter}` },
        { icon: 'github', link: `'https://github.com/${github}` },
      ],
    },
  })
}
