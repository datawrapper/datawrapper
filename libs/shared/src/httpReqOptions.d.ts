import nodeFetch, { RequestInit as NodeRequestInit } from 'node-fetch';

type FetchType = typeof window.fetch | typeof nodeFetch;
type FetchOptions = {
    headers?: Record<string, string>;
} & Omit<globalThis.RequestInit & NodeRequestInit, 'headers'>;

export type Response = Awaited<ReturnType<FetchType>>;

export type SimpleFetch = (url: string, opts: FetchOptions) => Promise<Response>;

export type HttpReqOptions = {
    baseUrl?: string;
    credentials?: RequestCredentials;
    disableCSFR?: boolean;
    fetch?: SimpleFetch;
    payload?: unknown;
    raw?: boolean;
} & FetchOptions;
