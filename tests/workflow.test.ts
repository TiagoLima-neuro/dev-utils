import test from "node:test";
import assert from "node:assert";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

import { getEncoderFormatLabel, isHashFormat } from "../src/encoders/workflow";

test("hash formats are always treated as one-way", () => {
  assert.strictEqual(isHashFormat("sha256-base64"), true);
  assert.strictEqual(isHashFormat("sha256-hex"), true);
  assert.strictEqual(isHashFormat("base64"), false);
  assert.strictEqual(getEncoderFormatLabel("sha256-hex"), "SHA256 (Hex)");
  assert.strictEqual(getEncoderFormatLabel("base64"), "Base64");
});
