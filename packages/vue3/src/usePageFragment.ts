import { injectPageFragmentContext } from './injectPageFragmentContext'
import { PageFragmentContext } from './providePageFragmentContext'
import { ContextOf } from './types'

export default function usePageFragment(): ContextOf<
  typeof PageFragmentContext
> {
  const fragment = injectPageFragmentContext()

  return fragment
}
