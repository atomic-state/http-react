import { renderHook } from "@testing-library/react-hooks"
import { useFetcher } from "../../"
import mocks from "../mocks"

test("GET data in JSON", async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method],
    })
  )

  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "",
    })
  )

  await waitForNextUpdate()

  if (result.current.loading)
    expect(result.current.data).toEqual({
      careers: [
        "Backend Developer",
        "Cloud Enginner",
        "DB Administrator",
        "Designer UI/UX",
        "Security Analist",
      ],
    })
})
