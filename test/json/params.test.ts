import { jsonCompare, setURLParams } from '../../'
import mocks from '../mocks'

test('Sets URL params in a string', async () => {
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
