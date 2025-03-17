import test from "node:test";
import assert from "node:assert";
import {
  gzipCompress,
  gzipDecompress,
  zstdCompress,
  zstdDecompress,
} from "../src/encoders/compression";
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

// Tests for ZSTD compression (mock implementation)
test("ZSTD Compress and Decompress (Mock)", async (t) => {
  const testCases = [
    "Hello, World!",
    "",
    "Test 123",
    "Special chars: !@#$%^&*()",
  ];

  for (const testCase of testCases) {
    const compressed = await zstdCompress(testCase);
    const decompressed = await zstdDecompress(compressed);
    assert.strictEqual(
      decompressed,
      testCase,
      `ZSTD mock failed for: ${testCase}`
    );
  }
});

test("ZSTD Decompression Error Handling", async (t) => {
  // Invalid input should throw an error
  const invalidInput = Buffer.from("InvalidContent").toString("base64");

  try {
    await zstdDecompress(invalidInput);
    // If we reach here, the test should fail
    assert.fail("Expected error was not thrown");
  } catch (error) {
    assert.strictEqual(
      error.message,
      "ZSTD decompression failed: Invalid ZSTD compressed data"
    );
  }
});
