import './vue'

export { default as createNavigareApp, default as createApp } from './createApp'

export {
  default as createNavigareForm,
  default as createForm,
} from './createForm'

export {
  default as navigareDevToolsPlugin,
  default as devToolsPlugin,
} from './devToolsPlugin'

export { Head as NavigareHead, Head } from '@vueuse/head'

export {
  default as NavigareDeferred,
  default as Deferred,
} from './components/Deferred'

export { default as NavigareForm, default as Form } from './components/Form'

export { default as NavigareInput, default as Input } from './components/Input'

export { default as NavigareLink, default as Link } from './components/Link'

export { default as mountNavigareApp, default as mountApp } from './mountApp'

export { default as renderNavigareApp, default as renderApp } from './renderApp'

export { default as NavigareRoot, default as Root } from './components/Root'

export {
  default as NavigareRoutable,
  default as Routable,
} from './components/Routable'

export {
  default as NavigareFragments,
  default as Fragments,
} from './components/Fragments'

export { default as plugin } from './plugin'

export {
  default as useNavigareForm,
  default as useForm,
} from './compositions/useForm'

export {
  default as useNavigareInput,
  default as useInput,
} from './compositions/useInput'

export {
  default as useNavigarePage,
  default as usePage,
} from './compositions/usePage'

export {
  default as useNavigareFragment,
  default as useFragment,
} from './compositions/useFragment'

export {
  default as useNavigareParameter,
  default as useParameter,
} from './compositions/useParameter'

export {
  default as useNavigareRouter,
  default as useRouter,
} from './compositions/useRouter'

export * from './types'

export * from './utilities'
