import { renderHook } from "@testing-library/react-hooks";
import { useFetcher } from "../../fetcher";

test("GET data in JSON", async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "https://express-backend-atomic.herokuapp.com/api/json/works",
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
    ],
  });
});
