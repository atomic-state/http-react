import { act, renderHook } from '@testing-library/react'
import { useFetcher } from '../../'
import mocks from '../mocks'

test('POST data in JSON', async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => Promise.resolve(mocks[config.method])
    })
  )

  await act(async () => {
    const { result } = renderHook(() =>
      useFetcher({
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
