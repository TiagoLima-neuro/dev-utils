import test from "node:test";
import assert from "node:assert";
import { validateCPF, validateCNPJ } from "../src/validators/brazilian";

// Tests for CPF validation
test("CPF Validator", (t) => {
  // Known valid CPFs for testing (these are common test CPFs, not real ones)
  const validCPFs = [
    "529.982.247-25",
    "52998224725",
    "111.444.777-35",
    "11144477735",
  ];

  // Known invalid CPFs
  const invalidCPFs = [
    // Incorrect verification digit
    "111.444.777-36",
    // Too short
    "1234567890",
    // Too long
    "123456789012",
    // All same digits (should be rejected)
    "111.111.111-11",
    "22222222222",
    // Random invalid number
    "123.456.789-10",
  ];

  // Test valid CPFs
  for (const cpf of validCPFs) {
    assert.strictEqual(validateCPF(cpf), true, `CPF ${cpf} should be valid`);
  }

  // Test invalid CPFs
  for (const cpf of invalidCPFs) {
    assert.strictEqual(validateCPF(cpf), false, `CPF ${cpf} should be invalid`);
  }
});

// Tests for CNPJ validation
test("CNPJ Validator", (t) => {
  // Known valid CNPJs for testing (these are common test CNPJs, not real ones)
  const validCNPJs = [
    "11.222.333/0001-81",
    "11222333000181",
    "14.163.397/0001-47",
    "14163397000147",
  ];

  // Known invalid CNPJs
  const invalidCNPJs = [
    // Incorrect verification digit
    "11.222.333/0001-82",
    // Too short
    "1122233300018",
    // Too long
    "112223330001811",
    // All same digits (should be rejected)
    "11.111.111/1111-11",
    "22222222222222",
    // Random invalid number
    "12.345.678/9012-34",
  ];

  // Test valid CNPJs
  for (const cnpj of validCNPJs) {
    assert.strictEqual(
      validateCNPJ(cnpj),
      true,
      `CNPJ ${cnpj} should be valid`
    );
  }

  // Test invalid CNPJs
  for (const cnpj of invalidCNPJs) {
    assert.strictEqual(
      validateCNPJ(cnpj),
      false,
      `CNPJ ${cnpj} should be invalid`
    );
  }
});
