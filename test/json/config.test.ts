import { act, renderHook, waitFor } from '@testing-library/react'
import useFetch from '../../'
import mocks from '../mocks'

test('Config is modified by AtomicState provider', async () => {
  // 1. Define the mock fetch function
  const mockFetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method]
    })
  )

  // 2. Define a simple mock function for 'preconnect'
  const mockPreconnect = jest.fn()

  // 3. Attach the 'preconnect' mock to the mock fetch function
  //    The 'as typeof fetch' assertion is crucial for satisfying TypeScript
  global.fetch = Object.assign(mockFetch, {
    preconnect: mockPreconnect
  }) as typeof fetch

  let r: any

  await act(async () => {
    const { result } = renderHook(() =>
      useFetch({
        url: '',
        default: [],
        baseUrl: 'test-url',
        method: 'DELETE',
        body: {
          careers: ['Backend Developer', 'Cloud Enginner', 'DB Administrator']
        }
      })
    )

    r = result
  })

  await waitFor(async () => {
    expect(r.current.config.baseUrl).toBe('test-url')
  })
})
