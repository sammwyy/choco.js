import type { App } from "./server";
import type { URLParts } from "./utils";

/**
 * Represents an HTTP request.
 * @property method - The HTTP method of the request.
 * @property headers - The headers of the request.
 */
export interface HTTPRequest extends URLParts {
  readonly method: HTTPMethod;
  readonly headers: HTTPReqHeaders;
  readonly body: {
    asArrayBuffer: () => Promise<ArrayBuffer>;
    asBlob: () => Promise<Blob>;
    asFormData: () => Promise<FormData>;
    asJSON: <T = unknown>() => Promise<T>;
    asText: () => Promise<string>;
    stream: ReadableStream<Uint8Array> | null;
  };
  readonly query: HTTPQueries;
  ip: string | undefined;
}

/**
 * Represents an HTTP response.
 * @property status - The status code of the response.
 * @property headers - The headers of the response.
 * @property data - The data of the response.
 */
export interface HTTPResponse {
  status: HTTPStatus;
  headers: HTTPResHeaders;
  data: ResponseData;
}

/**
 * Represents the context of an HTTP request/response.
 * @property req - The HTTP request.
 * @property res - The HTTP response.
 * @property timestamp - The timestamp of the request.
 */
export interface Context {
  req: HTTPRequest;
  res: HTTPResponse;
  params: Record<string, string>;
  timestamp: number;
  app: App;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
}

/**
 * Represents the data that can be returned in an HTTP response.
 */
export type ResponseData = string | object | Buffer | undefined | null;

/**
 * Represents the headers of an HTTP request.
 */
export type HTTPReqHeaders = Record<string, string | string[]>;

/**
 * Represents the header key of an HTTP response.
 */
export type HTTPReqHeaderKey =
  | string
  | "content-type"
  | "content-length"
  | "accept"
  | "accept-language"
  | "accept-encoding"
  | "host"
  | "user-agent"
  | "referer"
  | "cookie"
  | "origin"
  | "connection"
  | "cache-control"
  | "pragma"
  | "if-modified-since"
  | "if-none-match"
  | "if-match"
  | "if-unmodified-since"
  | "if-range"
  | "range"
  | "authorization"
  | "proxy-authorization"
  | "max-forwards"
  | "x-requested-with"
  | "x-forwarded-for"
  | "x-forwarded-host"
  | "x-forwarded-proto"
  | "x-real-ip"
  | "x-forwarded-server"
  | "x-forwarded-port"
  | "x-forwarded-by"
  | "x-forwarded-protocol"
  | "x-forwarded-ssl"
  | "x-forwarded-scheme";

/**
 * Represents the headers of an HTTP response.
 */
export type HTTPResHeaders = Record<HTTPResHeaderKey, string | string[]>;

/**
 * Represents the header key of an HTTP response.
 */
export type HTTPResHeaderKey =
  | string
  | "content-type"
  | "content-length"
  | "date"
  | "server"
  | "connection"
  | "transfer-encoding"
  | "content-encoding"
  | "vary"
  | "cache-control"
  | "pragma"
  | "expires"
  | "last-modified"
  | "etag"
  | "if-match"
  | "if-none-match"
  | "if-modified-since"
  | "if-unmodified-since"
  | "if-range"
  | "accept-ranges"
  | "age"
  | "allow"
  | "location"
  | "content-disposition"
  | "content-range"
  | "content-language"
  | "content-location"
  | "content-md5"
  | "content-security-policy"
  | "content-security-policy-report-only"
  | "content-type-options"
  | "x-content-type-options"
  | "cross-origin-resource-policy"
  | "x-content-duration"
  | "x-content-security-policy"
  | "x-content-security-policy-report-only"
  | "x-dns-prefetch-control"
  | "x-download-options"
  | "x-frame-options"
  | "x-permitted-cross-domain-policies"
  | "x-powered-by"
  | "x-request-id"
  | "x-xss-protection";

/**
 * Represents an HTTP status code.
 */
export type HTTPStatus = number;

/**
 * Represents an HTTP method.
 */
export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type HTTPQueries = Record<string, string | string[]>;
