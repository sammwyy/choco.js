import { expect, test } from "bun:test";

import { matchPath, parseURL, queryParser, type URLParts } from "../src/utils";

/**
 * parseURL based tests.
 */

function expectParseURL(url: string, expected: URLParts, error: string) {
  const message = `${error} (${url})`;
  const result = parseURL(url);
  expect(result, message).toEqual(expected);
}

test("URL parsing", () => {
  // Test URLs
  expectParseURL(
    "http://example.com:8080/path/to/resource?query=param#hash",
    {
      protocol: "http",
      host: "example.com",
      port: "8080",
      path: "/path/to/resource",
      queryStr: "?query=param",
      hash: "#hash",
      fullURL: "http://example.com:8080/path/to/resource?query=param#hash",
    },
    "Full URL parsing failed"
  );

  expectParseURL(
    "https://example.com/path?query=value",
    {
      protocol: "https",
      host: "example.com",
      port: undefined,
      path: "/path",
      queryStr: "?query=value",
      hash: undefined,
      fullURL: "https://example.com/path?query=value",
    },
    "URL parsing without port and hash failed"
  );

  expectParseURL(
    "ftp://example.com/resource#section",
    {
      protocol: "ftp",
      host: "example.com",
      port: undefined,
      path: "/resource",
      queryStr: undefined,
      hash: "#section",
      fullURL: "ftp://example.com/resource#section",
    },
    "URL parsing without query string failed"
  );

  expectParseURL(
    "http://example.com/",
    {
      protocol: "http",
      host: "example.com",
      port: undefined,
      path: "/",
      queryStr: undefined,
      hash: undefined,
      fullURL: "http://example.com/",
    },
    "URL parsing without query string and hash failed"
  );

  expectParseURL(
    "http://example.com:80/",
    {
      protocol: "http",
      host: "example.com",
      port: "80",
      path: "/",
      queryStr: undefined,
      hash: undefined,
      fullURL: "http://example.com:80/",
    },
    "URL parsing with port 80 failed"
  );
});

/**
 * matchPath based tests.
 */

function expectMatchPath(path: string | RegExp, value: string, error: string) {
  const message = `${error} (${path} !+ ${value})`;
  const result = matchPath("/", path, value);
  expect(result, message).toBeTrue();
}

test("Path parsing", () => {
  // Try to match paths with params.
  expectMatchPath("/:param", "/value", "Route with params didn't match");

  // Try to match paths wildcards.
  expectMatchPath("/test*", "/test123", "Route with wildcard didn't match");
  expectMatchPath("/he*llo", "/heyyyyyllo", "Route with wildcard didn't match");
  expectMatchPath("/*test", "/123test", "Route with wildcard didn't match");

  // Try to match reg-ex.
  expectMatchPath(/^\/test\/gi$/, "/test/gi", "Route with RegExp didn't match");
  expectMatchPath(
    /^\/test\/gi.*$/,
    "/test/giabc",
    "Route with RegExp didn't match"
  );
});

/**
 * queryParser based tests.
 */

type Queries = Record<string, string | string[] | undefined>;

function expectQueryParser(query: string, expected: Queries, error: string) {
  const message = `${error} (${query})`;
  const result = queryParser(query) as Queries;
  expect(result, message).toEqual(expected);
}

test("Query string parsing", () => {
  // Test query strings
  expectQueryParser(
    "?key1=value1&key2=value2",
    { key1: "value1", key2: "value2" },
    "Query string parsing failed"
  );

  expectQueryParser(
    "key1=value1&key2=value2",
    { key1: "value1", key2: "value2" },
    "Query string parsing without leading '?' failed"
  );

  expectQueryParser(
    "?key1=value1&key1=value2",
    { key1: ["value1", "value2"] },
    "Query string parsing with duplicate keys failed"
  );

  expectQueryParser(
    "?key1=value1&key2=value2&key1=value3",
    { key1: ["value1", "value3"], key2: "value2" },
    "Query string parsing with mixed duplicate keys failed"
  );

  expectQueryParser(
    "?key1=value1&key2",
    { key1: "value1", key2: "true" },
    "Query string parsing with key without value failed"
  );

  expectQueryParser("", {}, "Empty query string parsing failed");

  expectQueryParser(
    "?",
    {},
    "Empty query string with leading '?' parsing failed"
  );
});
