import { renderHook } from "@testing-library/react-hooks"
import { useFetcher } from "../../"
import mocks from "../mocks"

test("DELETE data in JSON", async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method],
    })
  )

  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "",
      default: [],
      config: {
        method: "DELETE",
        body: {
          careers: ["Backend Developer", "Cloud Enginner", "DB Administrator"],
        },
      },
    })
  )
  await waitForNextUpdate()

  if (result.current.loading)
    expect(result.current.data).toEqual({
      careers: ["Designer UI/UX", "Security Analist"],
    })
})
