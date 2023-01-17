import { act, renderHook, waitFor } from '@testing-library/react'
import { useFetcher } from '../../'
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
