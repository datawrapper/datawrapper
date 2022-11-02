import nodeFetch, { RequestInit as NodeRequestInit } from 'node-fetch';

type FetchType = typeof window.fetch | typeof nodeFetch;

export type SimpleFetchOptions = {
    headers?: Record<string, string>;
} & Omit<globalThis.RequestInit & NodeRequestInit, 'headers'>;

export type SimpleFetchResponse = Awaited<ReturnType<FetchType>>;

/**
 * SimpleFetch is a union of window.fetch and node-fetch, because httpReq has to work with both.
 */
export type SimpleFetch = (url: string, opts: SimpleFetchOptions) => Promise<SimpleFetchResponse>;

export type HttpReqOptions = {
    baseUrl?: string;
    credentials?: RequestCredentials;
    disableCSRF?: boolean;
    fetch?: SimpleFetch;
    payload?: unknown;
    raw?: boolean;
} & SimpleFetchOptions;
