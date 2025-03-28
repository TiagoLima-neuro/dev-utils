/**
 * Brazilian CPF and CNPJ validators
 * Client-side only implementation without external dependencies
 */

// CPF Validator
export function validateCPF(cpf: string): boolean {
  // Clean the input by removing non-numeric characters
  cpf = cpf.replace(/[^\d]/g, "");

  // CPF must be exactly 11 digits
  if (cpf.length !== 11) {
    return false;
  }

  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  // Check if the calculated verification digits match the provided ones
  return (
    digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10))
  );
}

export function validateCNPJ(cnpj: string) {
  const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const c = String(cnpj).replace(/[^\d]/g, "");

  if (c.length !== 14) return false;

  if (/0{14}/.test(c)) return false;

  for (var i = 0, n = 0; i < 12; n += Number(c[i]) * b[++i]);
  if (c[12] !== String((n %= 11) < 2 ? 0 : 11 - n)) return false;

  for (var i = 0, n = 0; i <= 12; n += Number(c[i]) * b[i++]);
  if (c[13] !== String((n %= 11) < 2 ? 0 : 11 - n)) return false;

  return true;
}
