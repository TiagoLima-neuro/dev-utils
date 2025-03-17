/**
 * Brazilian CPF and CNPJ validators
 * Client-side only implementation without external dependencies
 */

// CPF Validator
export function validateCPF(cpf: string): boolean {
    // Clean the input by removing non-numeric characters
    cpf = cpf.replace(/[^\d]/g, '');
    
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
    return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
}

// CNPJ Validator
export function validateCNPJ(cnpj: string): boolean {
    // Clean the input by removing non-numeric characters
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // CNPJ must be exactly 14 digits
    if (cnpj.length !== 14) {
        return false;
    }
    
    // Check for known invalid CNPJs (all same digits)
    if (/^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    
    // Calculate first verification digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Calculate second verification digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    // Check if the calculated verification digits match the provided ones
    return digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13));
}
