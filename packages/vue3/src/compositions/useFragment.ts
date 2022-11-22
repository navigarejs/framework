import { injectFragmentContext } from './../contexts/injectFragmentContext'
import { FragmentContext } from './../contexts/provideFragmentContext'
import { ContextOf } from './../types'

export default function useFragment(): ContextOf<typeof FragmentContext> {
  const fragment = injectFragmentContext()

  return fragment
}
