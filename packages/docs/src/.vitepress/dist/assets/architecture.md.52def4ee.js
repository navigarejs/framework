import { _ as e, c as t, o as l, a as i } from './app.3548c54e.js'

const h =
    '{"title":"","description":"","frontmatter":{},"headers":[{"level":2,"title":"Client","slug":"client"}],"relativePath":"architecture.md","lastUpdated":1667585383000}',
  a = {},
  r = i(
    '<ul><li><p>Development</p><ul><li>SSR <ul><li>Adapter does not read any manifest</li><li>Adapter calls SSR server <ul><li>Adapter prepares page so it can resolve the dependencies via <strong>absolute paths</strong></li><li>Adapter passes page client manifest to SSR server so it can generate the preload links</li></ul></li><li>Adapter renders page</li></ul></li><li><h2 id="client" tabindex="-1">Client <a class="header-anchor" href="#client" aria-hidden="true">#</a></h2></li></ul></li><li><p>Production</p><ul><li>SSR <ul><li>Adapter reads SSR and client manifest</li><li>Adapter calls SSR server <ul><li>Adapter prepares page using SSR manifest so it can resolve the <strong>built</strong> dependencies via <strong>absolute paths</strong></li><li>Adapter passes page client manifest to SSR server so it can generate the preload links</li></ul></li><li>Adapter renders page using client manifest</li></ul></li><li>Client</li></ul></li></ul>',
    1,
  ),
  s = [r]
function n(o, p, d, c, u, _) {
  return l(), t('div', null, s)
}
var g = e(a, [['render', n]])
export { h as __pageData, g as default }
