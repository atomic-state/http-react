import { act, renderHook } from "@testing-library/react"
import { useFetcher } from "../../"
import mocks from "../mocks"

test("DELETE data in JSON", async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method],
    })
  )

  await act(async () => {
    const { result } = renderHook(() =>
      useFetcher({
        url: "",
        default: [],
        config: {
          method: "DELETE",
          body: {
            careers: [
              "Backend Developer",
              "Cloud Enginner",
              "DB Administrator",
            ],
          },
        },
      })
    )

    if (result.current?.data)
      expect(result.current.data).toEqual({
        careers: ["Designer UI/UX", "Security Analist"],
      })
  })
})
