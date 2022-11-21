import { injectFragmentContext } from './../contexts/injectFragmentContext'
import { FragmentContext } from './../contexts/provideFragmentContext'
import { ContextOf } from './../types'

export default function duseFragment(): ContextOf<typeof FragmentContext> {
  const fragment = injectFragmentContext()

  return fragment
}
