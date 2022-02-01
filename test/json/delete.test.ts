import { renderHook } from "@testing-library/react-hooks";
import { useFetcher } from "../../fetcher";

test("DELETE data in JSON", async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useFetcher({
      url: "https://express-backend-atomic.herokuapp.com/api/json/work",
      config: {
        method: "DELETE",
        body: {
          careers: ["Backend Developer", "Cloud Enginner", "DB Administrator"],
        },
      },
    })
  );
  await waitForNextUpdate();

  expect(result.current.loading).toBe(false);

  expect(result.current.data).toEqual({
    careers: ["Designer UI/UX", "Security Analist"],
  });
});