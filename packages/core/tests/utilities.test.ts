import { Fragment, RawRoute, RouterLocation } from '../src'
import { Page, Properties } from '../src/types'
import { mergeFragments } from '../src/utilities'
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

describe('mergeFragments', () => {
  const createPage = (pathname: string = '', visitId: string = ''): Page => {
    return {
      location: createLocation({
        pathname,
      }),
      defaults: {},
      parameters: {},
      rawRoute: null as unknown as RawRoute,
      visit: {
        id: visitId,
      },
    } as Page
  }

  const createFragment = (
    properties: Properties = {},
    page: Page = createPage(),
  ): Fragment => {
    return {
      name: '',
      component: {
        id: '',
        path: '',
      },
      properties,
      page,
      fallback: false,
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
          default: [nextDefaultFragment],
        },
      ),
    ).toEqual({
      default: [nextDefaultFragment],
    })
  })

  it('keeps fragments when next fragment is undefined', () => {
    const initialDefaultFragment = createFragment()

    expect(
      mergeFragments(
        {
          default: [initialDefaultFragment],
        },
        {},
      ),
    ).toEqual({
      default: [initialDefaultFragment],
    })
  })

  it('cleans fragments when next fragment is null', () => {
    const initialDefaultFragment = createFragment()

    expect(
      mergeFragments(
        {
          default: [initialDefaultFragment],
        },
        {
          default: null,
        },
      ),
    ).toEqual({
      default: null,
    })
  })

  it('skip fallback fragments when fragment is already set', () => {
    const initialDefaultFragment = createFragment()
    const nextDefaultFallbackFragment = {
      ...createFragment(
        {
          initial: false,
        },
        createPage('next'),
      ),
      fallback: true,
    }

    expect(
      mergeFragments(
        {
          default: [initialDefaultFragment],
        },
        {
          default: [nextDefaultFallbackFragment],
        },
      ),
    ).toEqual({
      default: [initialDefaultFragment],
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
            modal: [nextModalFragment],
          },
          {
            modal: {
              stacked: true,
            },
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
            modal: [nextModalFragment],
          },
          {
            modal: {
              stacked: true,
            },
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
          {
            modal: {
              stacked: true,
            },
          },
        ),
      ).toEqual({
        modal: null,
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
          {
            modal: {
              stacked: true,
            },
          },
        ),
      ).toEqual({
        modal: null,
      })
    })
  })

  describe('inert', () => {
    it('keeps inert fragments in "default" when next fragment is undefined', () => {
      const initialDefaultFragment = createFragment()

      expect(
        mergeFragments(
          {
            default: [initialDefaultFragment],
          },
          {},
          {},
        ),
      ).toEqual({
        default: [initialDefaultFragment],
      })
    })

    it('removes fragments in "default" when explicitly not set to inert and next fragment is undefined', () => {
      const initialDefaultFragment = createFragment()

      expect(
        mergeFragments(
          {
            default: [initialDefaultFragment],
          },
          {},
          {
            default: {
              inert: false,
            },
          },
        ),
      ).toEqual({
        default: null,
      })
    })

    it('keeps inert fragments when next fragment is undefined', () => {
      const initialLeftFragment = createFragment()

      expect(
        mergeFragments(
          {
            left: [initialLeftFragment],
          },
          {},
          {
            left: {
              inert: true,
            },
          },
        ),
      ).toEqual({
        left: [initialLeftFragment],
      })
    })
  })

  describe('lazy', () => {
    it('reuses previous visit when components are the same', () => {
      const initialVisitId = '1'
      const initialLeftFragment = createFragment(
        {
          foo: 'bar',
        },
        createPage(undefined, initialVisitId),
      )
      const nextLeftFragment = createFragment(
        {
          foo: 'foo',
        },
        createPage(undefined, '2'),
      )

      expect(
        mergeFragments(
          {
            left: [initialLeftFragment],
          },
          {
            left: [nextLeftFragment],
          },
          {
            left: {
              lazy: true,
            },
          },
        ),
      ).toEqual({
        left: [
          {
            ...nextLeftFragment,
            page: {
              ...nextLeftFragment.page,
              visit: {
                id: initialVisitId,
              },
            },
          },
        ],
      })
    })
  })
})
