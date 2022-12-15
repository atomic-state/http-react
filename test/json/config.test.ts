import { act, renderHook, waitFor } from '@testing-library/react'
import { fetcher, FetcherConfig, useFetcher } from '../../'
import mocks from '../mocks'

test('Config is modified by AtomicState provider', async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method]
    })
  )

  let r: any

  await act(async () => {
    const { result } = renderHook(() =>
      useFetcher({
        url: '',
        default: [],
        config: {
          baseUrl: 'test-url',
          method: 'DELETE',
          body: {
            careers: ['Backend Developer', 'Cloud Enginner', 'DB Administrator']
          }
        }
      })
    )

    r = result
  })
  await waitFor(async () => {
    expect(r.current.config.baseUrl).toBe('test-url')
  })
})

test('Extending fetcher should allow to set query params', async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method]
    })
  )

  const extended = fetcher.extend({
    query: {
      a: 'b'
    }
  })

  await act(async () => {
    const { config } = await extended.get('/some-url', {
      config: {
        query: {
          b: 'c'
        }
      }
    })

    expect(config.query.a).toBe('b')
    expect(config.query.b).toBe('c')
  })

  await act(async () => {
    const { config } = await fetcher.get(
      '/some-url?existingParam=etc&other=z',
      {
        config: {
          query: {
            b: 'c'
          }
        }
      }
    )

    expect(config.query.existingParam).toBe('etc')
    expect(config.query.other).toBe('z')
    expect(config.query.b).toBe('c')
  })
})
