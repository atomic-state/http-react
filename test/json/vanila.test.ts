import { act } from "@testing-library/react";
import { fetcher } from "../../vanila";
import mocks from "../mocks";

test("DELETE data in JSON", async () => {
  global.fetch = jest.fn().mockImplementation((url, config) =>
    Promise.resolve({
      json: () => mocks[config.method],
    })
  );

  await act(async () => {
    const { data } = await fetcher.delete("", {
      default: [],
      config: {
        body: {
          careers: ["Backend Developer", "Cloud Enginner", "DB Administrator"],
        },
      },
    });

    expect(data).toEqual({
      careers: ["Designer UI/UX", "Security Analist"],
    });
  });
});
