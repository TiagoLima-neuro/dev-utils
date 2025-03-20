import test from "node:test";
import assert from "node:assert";
import { gzipCompress, gzipDecompress } from "../src/encoders/compression";
import { TextEncoder, TextDecoder } from "util";

// Mock browser APIs for Node testing environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Tests for GZIP compression
test("GZIP Compress and Decompress", async (t) => {
  const testCases = [
    "Hello, World!",
    "",
    "Test 123",
    "A longer string to test compression efficiency. This should be significantly compressed.",
    "Special chars: !@#$%^&*()",
  ];

  for (const testCase of testCases) {
    const compressed = await gzipCompress(testCase);
    const decompressed = await gzipDecompress(compressed);
    assert.strictEqual(decompressed, testCase, `GZIP failed for: ${testCase}`);
  }
});
