import test from "node:test";
import assert from "node:assert";
import { TextEncoder, TextDecoder } from "util";

// Mock browser APIs for Node environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Import the actual functions from source files
import {
  base64Encode,
  base64Decode,
  base91Decode,
  base91Encode,
} from "../src/encoders/base";

// Base91 implementation
const BASE91_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

// Tests for Base64
test("Base64 Encode", (t) => {
  assert.strictEqual(base64Encode("Hello, World!"), "SGVsbG8sIFdvcmxkIQ==");
  assert.strictEqual(base64Encode(""), "");
  assert.strictEqual(base64Encode("12345"), "MTIzNDU=");
  assert.strictEqual(
    base64Encode("Special chars: !@#$%^&*()"),
    "U3BlY2lhbCBjaGFyczogIUAjJCVeJiooKQ=="
  );
});

test("Base64 Decode", (t) => {
  assert.strictEqual(base64Decode("SGVsbG8sIFdvcmxkIQ=="), "Hello, World!");
  assert.strictEqual(base64Decode(""), "");
  assert.strictEqual(base64Decode("MTIzNDU="), "12345");
  assert.strictEqual(
    base64Decode("U3BlY2lhbCBjaGFyczogIUAjJCVeJiooKQ=="),
    "Special chars: !@#$%^&*()"
  );
});

// Tests for Base91
test("Base91 Encode and Decode", (t) => {
  const testCases = [
    "Hello, World!",
    "",
    "Test 123",
    "Special chars: !@#$%^&*()",
  ];

  for (const testCase of testCases) {
    const encoded = base91Encode(testCase);
    const decoded = base91Decode(encoded);
    assert.strictEqual(decoded, testCase, `Base91 failed for: ${testCase}`);
  }
});

test("Base91 Specific Encode Cases", (t) => {
  // These are specific test cases to ensure our Base91 implementation is correct
  assert.strictEqual(base91Decode(base91Encode("test")), "test");
  assert.strictEqual(
    base91Decode(
      base91Encode(
        "This is a longer text to ensure proper encoding and decoding"
      )
    ),
    "This is a longer text to ensure proper encoding and decoding"
  );
});
