import test from "node:test";
import assert from "node:assert";
import { validateJson, formatJson } from "../src/formatters";
// Tests for JSON formatter and validator
test("JSON Validator", (t) => {
  // Valid JSON
  assert.strictEqual(validateJson('{"name": "John", "age": 30}'), true);
  assert.strictEqual(validateJson("[]"), true);
  assert.strictEqual(validateJson('{"nested": {"value": true}}'), true);
  assert.strictEqual(validateJson('"simple string"'), true);
  assert.strictEqual(validateJson("123"), true);

  // Invalid JSON
  assert.strictEqual(validateJson('{name: "John"}'), false); // Missing quotes around property name
  assert.strictEqual(validateJson('{"name": "John",}'), false); // Trailing comma
  assert.strictEqual(validateJson('{"name": "John"'), false); // Missing closing brace
  assert.strictEqual(validateJson('name: "John"'), false); // Not JSON format
});

test("JSON Formatter", (t) => {
  // Test pretty formatting
  const uglyJson =
    '{"name":"John","age":30,"address":{"street":"123 Main St","city":"Anytown"}}';
  const prettyJson = `{
  "name": "John",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  }
}`;

  assert.strictEqual(formatJson(uglyJson), prettyJson);

  // Simple cases
  assert.strictEqual(formatJson('"test"'), '"test"');
  assert.strictEqual(formatJson("123"), "123");

  // Error handling
  try {
    formatJson('{"invalid": }');
    assert.fail("Should have thrown an error for invalid JSON");
  } catch (error) {
    assert.ok(error.message.includes("Invalid JSON"));
  }
});
