import { renderHook } from "@testing-library/react-hooks"
import { useFetcher } from "../../"
import mocks from "../mocks"

test("POST data in JSON", async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => Promise.resolve(mocks[config.method]),
    })
  )

  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "",
      config: {
        method: "POST",
        body: {
          careers: ["Python Developer", "Frontend Developer"],
        },
      },
    })
  )
  await waitForNextUpdate()

  if (result.current.data)
    expect(result.current.data).toEqual({
      careers: [
        "Backend Developer",
        "Cloud Enginner",
        "DB Administrator",
        "Designer UI/UX",
        "Security Analist",
        "Python Developer",
        "Frontend Developer",
      ],
    })
})
