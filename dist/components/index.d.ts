import React from 'react';
import { FetcherContextType } from '../types';
/**
 * This is a wrapper around `Suspense`. It will render `fallback` during the first render and then leave the rendering to `Suspense`. If you are not using SSR, you should continue using the `Suspense` component.
 */
export declare function SSRSuspense({ fallback, children }: {
    fallback?: React.ReactNode;
    children?: React.ReactNode;
}): JSX.Element;
export declare function FetcherConfig(props: FetcherContextType): JSX.Element;
