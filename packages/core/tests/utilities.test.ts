import {
  PageFragment,
  PageFragmentProperties,
  RawRoute,
  RouterLocation,
} from '../src'
import { Page } from '../src/types'
import { getInitialFragments, mergeFragments } from '../src/utilities'
import { describe, expect, it } from 'vitest'

const createLocation = (options: { pathname: string }): RouterLocation => {
  const { pathname = '' } = options

  return {
    href: `https://navigare.test:443/${pathname}`,
    host: 'navigare.test:443',
    hostname: 'navigare.test',
    origin: 'https://navigare.test:443',
    pathname,
    port: '443',
    protocol: 'https',
    search: '',
    hash: '',
    state: undefined,
  }
}

describe('getInitialFragments', () => {
  it('returns an empty object if no explicit fragments are defined', () => {
    expect(getInitialFragments()).toEqual({})
  })

  it('returns initially null for explicit fragments', () => {
    expect(
      getInitialFragments({
        default: {},
      }),
    ).toEqual({
      default: null,
    })
  })

  it('returns an array for explicit fragments that can be stacked', () => {
    expect(
      getInitialFragments({
        modal: {
          stacked: true,
        },
      }),
    ).toEqual({
      modal: [],
    })
  })

  it('returns merged fragments', () => {
    expect(
      getInitialFragments({
        default: {},
        modal: {
          stacked: true,
        },
      }),
    ).toEqual({
      default: null,
      modal: [],
    })
  })
})

describe('mergeFragments', () => {
  const createPage = (pathname: string = ''): Page => {
    return {
      location: createLocation({
        pathname,
      }),
      defaults: {},
      parameters: {},
      rawRoute: null as unknown as RawRoute,
    } as Page
  }

  const createFragment = (
    properties: PageFragmentProperties = {},
    page: Page = createPage(),
  ): PageFragment => {
    return {
      component: {
        id: '',
        path: '',
      },
      properties,
      page,
    }
  }

  it('merges fragments by replacing them', () => {
    const nextDefaultFragment = createFragment()

    expect(
      mergeFragments(
        {
          default: null,
        },
        {
          default: nextDefaultFragment,
        },
      ),
    ).toEqual({
      default: nextDefaultFragment,
    })
  })

  it('keeps fragments when next fragment is undefined', () => {
    const initialDefaultFragment = createFragment()

    expect(
      mergeFragments(
        {
          default: initialDefaultFragment,
        },
        {},
      ),
    ).toEqual({
      default: initialDefaultFragment,
    })
  })

  it('cleans fragments when next fragment is null', () => {
    const initialDefaultFragment = createFragment()

    expect(
      mergeFragments(
        {
          default: initialDefaultFragment,
        },
        {
          default: null,
        },
      ),
    ).toEqual({
      default: null,
    })
  })

  describe('stacked', () => {
    it('merges stacked fragments by concatenating them', () => {
      const initialModalFragment = createFragment({
        initial: true,
      })
      const nextModalFragment = createFragment(
        {
          initial: false,
        },
        createPage('next'),
      )

      expect(
        mergeFragments(
          {
            modal: [initialModalFragment],
          },
          {
            modal: nextModalFragment,
          },
        ),
      ).toEqual({
        modal: [initialModalFragment, nextModalFragment],
      })
    })

    it('merges stacked fragments by reusing previous fragments', () => {
      const initialModalFragment = createFragment({
        initial: true,
      })
      const nextModalFragment = createFragment({
        initial: false,
      })

      expect(
        mergeFragments(
          {
            modal: [initialModalFragment],
          },
          {
            modal: nextModalFragment,
          },
        ),
      ).toEqual({
        modal: [nextModalFragment],
      })
    })

    it('cleans stacked fragments when next fragment is undefined', () => {
      const initialModalFragment = createFragment()

      expect(
        mergeFragments(
          {
            modal: [initialModalFragment],
          },
          {},
        ),
      ).toEqual({
        modal: [],
      })
    })

    it('cleans stacked fragments when next fragment is null', () => {
      const initialModalFragment = createFragment()

      expect(
        mergeFragments(
          {
            modal: [initialModalFragment],
          },
          {
            modal: null,
          },
        ),
      ).toEqual({
        modal: [],
      })
    })
  })

  describe('lazy', () => {
    it('keeps lazy fragments in "default" when next fragment is undefined', () => {
      const initialDefaultFragment = createFragment()

      expect(
        mergeFragments(
          {
            default: initialDefaultFragment,
          },
          {},
          {},
        ),
      ).toEqual({
        default: initialDefaultFragment,
      })
    })

    it('removes fragments in "default" when explicitly not set to lazy and next fragment is undefined', () => {
      const initialDefaultFragment = createFragment()

      expect(
        mergeFragments(
          {
            default: initialDefaultFragment,
          },
          {},
          {
            default: {
              lazy: false,
            },
          },
        ),
      ).toEqual({
        default: null,
      })
    })

    it('keeps lazy fragments when next fragment is undefined', () => {
      const initialDefaultFragment = createFragment()

      expect(
        mergeFragments(
          {
            left: initialDefaultFragment,
          },
          {},
          {
            left: {
              lazy: true,
            },
          },
        ),
      ).toEqual({
        left: initialDefaultFragment,
      })
    })
  })
})
