import { jsonCompare, setURLParams } from '../../'
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

test('Shallow compares json objects', () => {
  expect(jsonCompare({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  expect(jsonCompare({ a: 1, b: 2, c: 3 }, { a: 1, c: 3, b: 2 })).toBe(true)
  expect(jsonCompare({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 })).toBe(true)
})
