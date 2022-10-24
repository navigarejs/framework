import { describe, expect, it } from 'vitest'
import { PageFragment, RawRoute, RouterLocation } from '../src'
import { getInitialFragments, mergeFragments } from '../src/utilities'

const location: RouterLocation = {
  href: 'https://navigare.test:443/',
  host: 'navigare.test:443',
  hostname: 'navigare.test',
  origin: 'https://navigare.test:443',
  pathname: '',
  port: '443',
  protocol: 'https',
  search: '',
  hash: '',
  state: undefined,
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
  const createFragment = (): PageFragment => {
    return {
      component: '',
      defaults: {},
      location,
      parameters: {},
      props: {},
      rawRoute: null as unknown as RawRoute,
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

  it('merges stacked fragments by concatenating them', () => {
    const initialModalFragment = createFragment()
    const nextModalFragment = createFragment()

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
