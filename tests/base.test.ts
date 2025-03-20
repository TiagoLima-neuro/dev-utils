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
  sha256,
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

test("SHA256 Base64 Encode", async (t) => {
  assert.strictEqual(
    await sha256("Hello, World!", "base64"),
    "3/1gIbsr1bCvZ2KQgJ7DpTGR3YHH9wpLKGiKNiGCmG8="
  );
  assert.strictEqual(
    await sha256("", "base64"),
    "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
  );
  assert.strictEqual(
    await sha256("12345", "base64"),
    "WZRHGrsBESr8wYFZ9sx0tPURuZgG2lmzyvWpwXPKz8U="
  );
  assert.strictEqual(
    await sha256("Special chars: !@#$%^&*()", "base64"),
    "ghfX0tW9GJkfX5Nmz3s2RGDlDanUtL92aZhjloubYD0="
  );
});

// Tests for SHA256 Hex
test("SHA256 Hex Encode", async (t) => {
  assert.strictEqual(
    await sha256("Hello, World!", "hex"),
    "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
  );
  assert.strictEqual(
    await sha256("", "hex"),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  assert.strictEqual(
    await sha256("12345", "hex"),
    "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5"
  );
  assert.strictEqual(
    await sha256("Special chars: !@#$%^&*()", "hex"),
    "8217d7d2d5bd18991f5f9366cf7b364460e50da9d4b4bf76699863968b9b603d"
  );
});
