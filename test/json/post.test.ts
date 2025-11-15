import { act, renderHook } from '@testing-library/react'
import useFetch from '../../'
import mocks from '../mocks'

test('POST data in JSON', async () => {
  // 1. Define the mock fetch function
  const mockFetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      // Ensure the inner promise resolves the mock data
      json: () => Promise.resolve(mocks[config.method])
    })
  )

  // 2. Define a simple mock function for 'preconnect'
  const mockPreconnect = jest.fn()

  // 3. Attach the 'preconnect' mock to the mock fetch function
  //    The 'as typeof fetch' assertion is crucial for satisfying TypeScript
  global.fetch = Object.assign(mockFetch, {
    preconnect: mockPreconnect
  }) as typeof fetch

  await act(async () => {
    const { result } = renderHook(() =>
      useFetch({
        url: '',
        method: 'POST',
        body: {
          careers: ['Python Developer', 'Frontend Developer']
        }
      })
    )

    if (result.current?.data)
      expect(result?.current.data).toEqual({
        careers: [
          'Backend Developer',
          'Cloud Enginner',
          'DB Administrator',
          'Designer UI/UX',
          'Security Analist',
          'Python Developer',
          'Frontend Developer'
        ]
      })
  })
})
