import { renderHook } from "@testing-library/react-hooks";
import { useFetcher } from "../../fetcher";

test("POST data in JSON", async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "https://express-backend-atomic.herokuapp.com/api/json/work",
      config: {
        method: "POST",
        body: {
          careers: ["Python Developer", "Frontend Developer"],
        },
      },
    })
  );
  await waitForNextUpdate();

  expect(result.current.loading).toBe(false);

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
  });
});
