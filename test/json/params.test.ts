import { setURLParams } from '../../'
import mocks from '../mocks'

test('Sets URL params in a string', async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method]
    })
  )

  const parsedUrl = setURLParams('/api/[resource]/:id', {
    resource: 'info',
    id: 1
  })

  const parsedWithQuery = setURLParams('/api/[resource]/:id?a=b', {
    resource: 'info',
    id: 1
  })

  expect(parsedUrl).toBe('/api/info/1')
  expect(parsedWithQuery).toBe('/api/info/1?a=b')
})
