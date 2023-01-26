import { act, renderHook } from '@testing-library/react'
import useFetch from '../../'
import mocks from '../mocks'

test('GET data in JSON', async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method]
    })
  )

  await act(async () => {
    const { result } = renderHook(useFetch, {
      initialProps: {
        url: ''
      }
    })

    if (result.current?.data)
      expect(result.current.data).toEqual({
        careers: [
          'Backend Developer',
          'Cloud Enginner',
          'DB Administrator',
          'Designer UI/UX',
          'Security Analist'
        ]
      })
  })
})
