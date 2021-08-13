import * as React from "react";
import { useState, useEffect } from "react";

interface FetcherType<FetchDataType> {
  /**
   * url of the resource to fetch
   */
  url: string;
  /**
   * Default data value
   */
  default?: FetchDataType;
  /**
   * Refresh interval (in seconds) to re-fetch the resource
   */
  refresh: number;
  /**
   * Function to run when request is resolved succesfuly
   */
  onResolve?: (data: FetchDataType) => void;
  /**
   * Function to run when the request fails
   */
  onError?: (error: Error) => void;
  /**
   * Request configuration
   */
  config?: {
    /**
     * Request method
     */
    method?:
      | "GET"
      | "DELETE"
      | "HEAD"
      | "OPTIONS"
      | "POST"
      | "PUT"
      | "PATCH"
      | "PURGE"
      | "LINK"
      | "UNLINK";
    headers?: Headers | object;
    body?: Body | object;
  };
  children?: React.FC<{
    data: FetchDataType | undefined;
    error: Error | null;
    loading: boolean;
  }>;
}

const Fetcher = <FetchDataType extends unknown>({
  url = "/",
  default: def,
  config = { method: "GET", headers: {} as Headers, body: {} as Body },
  children: Children,
  onError = () => {},
  onResolve = () => {},
  refresh = 0,
}: FetcherType<FetchDataType>) => {
  const [data, setData] = useState<FetchDataType | undefined>(def);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        const json = await fetch(url, {
          headers: config.headers as Headers,
          body: config.method?.match(/(POST|PUT|DELETE)/)
            ? JSON.stringify(config.body)
            : undefined,
        });
        const _data = await json.json();
        setData(_data);
        setLoading(false);
        onResolve(_data);
      } catch (err) {
        setError(new Error(err));
        setLoading(false);
        onError(err);
      }
    }
    fetchData();

    const refreshInterval: NodeJS.Timer | null =
      refresh > 0
        ? setInterval(() => {
            fetchData();
          }, refresh * 1000)
        : null;

    return () => clearInterval(refreshInterval as NodeJS.Timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refresh]);
  if (typeof Children !== "undefined") {
    return <Children data={data} error={error} loading={loading} />;
  } else {
    return null;
  }
};

export default Fetcher;