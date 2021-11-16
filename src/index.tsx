import * as React from "react";
import { useState, useEffect } from "react";

type FetcherType<FetchDataType> = {
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
  refresh?: number;
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
};

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
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const json = await fetch(url, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        } as Headers,
        body: config.method?.match(/(POST|PUT|DELETE)/)
          ? JSON.stringify(config.body)
          : undefined,
      });
      const _data = await json.json();
      const code = json.status;
      if (code >= 200 && code < 300) {
        setData(_data);
        setError(null);
        onResolve(_data);
      } else {
        if (def) {
          setData(def);
        }
        setError(true);
        onError(_data);
      }
    } catch (err) {
      setData(undefined);
      setError(new Error(err));
      onError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function reValidate() {
      if ((data || error) && !loading) {
        setLoading(true);
        fetchData();
      }
    }
    if (refresh > 0) {
      const interval = setTimeout(reValidate, refresh * 1000);
      return () => clearTimeout(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, data, config]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refresh, config]);
  if (typeof Children !== "undefined") {
    return <Children data={data} error={error} loading={loading} />;
  } else {
    return null;
  }
};

export default Fetcher;

/**
 * Fetcher available as a hook
 */

export const useFetcher = <FetchDataType extends unknown>({
  url = "/",
  default: def,
  config = { method: "GET", headers: {} as Headers, body: {} as Body },
  children: Children,
  onError = () => {},
  onResolve = () => {},
  refresh = 0,
}: FetcherType<FetchDataType>) => {
  const [data, setData] = useState<FetchDataType | undefined>(def);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const json = await fetch(url, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        } as Headers,
        body: config.method?.match(/(POST|PUT|DELETE)/)
          ? JSON.stringify(config.body)
          : undefined,
      });
      const _data = await json.json();
      const code = json.status;
      if (code >= 200 && code < 300) {
        setData(_data);
        setError(null);
        onResolve(_data);
      } else {
        if (def) {
          setData(def);
        }
        setError(true);
        onError(_data);
      }
    } catch (err) {
      setData(undefined);
      setError(new Error(err));
      onError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function reValidate() {
      if ((data || error) && !loading) {
        setLoading(true);
        fetchData();
      }
    }
    if (refresh > 0) {
      const interval = setTimeout(reValidate, refresh * 1000);
      return () => clearTimeout(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, data, config]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refresh, JSON.stringify(config)]);

  return { data, loading, error } as {
    data: FetchDataType;
    loading: boolean;
    error: Error | null;
  };
};
