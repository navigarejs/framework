import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'

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
    title: 'Navigare',

    description: pkg.description,

    appearance: true,

    lastUpdated: true,

    base: isCI ? '/framework' : undefined,

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
          'Released under the [MIT License](https://navigarejs.github.com/framework/blob/main/LICENSE)</a>.',
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

      sidebar: {
        '/guide/': [
          {
            text: 'Getting started',
            items: [
              {
                text: 'Introduction',
                link: '/guide/getting-started/introduction',
              },
              {
                text: 'Who is Navigare for?',
                link: '/guide/getting-started/who-is-it-for',
              },
              {
                text: 'How it works',
                link: '/guide/getting-started/how-it-works',
              },
              {
                text: 'Demonstration',
                link: '/guide/getting-started/demonstration',
              },
            ],
          },
          {
            text: 'Installation',
            items: [
              { text: 'Server', link: '/guide/installation/server' },
              { text: 'Client', link: '/guide/installation/client' },
            ],
          },
          {
            text: 'Basics',
            items: [
              { text: 'Routing', link: '/guide/basics/routing' },
              { text: 'Responses', link: '/guide/basics/responses' },
              { text: 'Pages', link: '/guide/basics/pages' },
              { text: 'Fragments', link: '/guide/basics/fragments' },
              { text: 'Layouts', link: '/guide/basics/layouts' },
              { text: 'Modals', link: '/guide/basics/modals' },
              { text: 'Title & Meta', link: '/guide/basics/head' },
              { text: 'Links', link: '/guide/basics/links' },
              { text: 'Manual visits', link: '/guide/basics/manual-visits' },
              { text: 'Redirects', link: '/guide/basics/redirects' },
              { text: 'Forms', link: '/guide/basics/forms' },
              { text: 'File uploads', link: '/guide/basics/file-uploads' },
              { text: 'Validation', link: '/guide/basics/validation' },
              {
                text: 'Shared properties',
                link: '/guide/basics/shared-properties',
              },
              { text: 'Configuration', link: '/guide/basics/configuration' },
              {
                text: 'Server Side Rendering',
                link: '/guide/basics/server-side-rendering',
              },
            ],
          },
        ],
      },
    },
  })
}
