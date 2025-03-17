/**
 * Base64 and Base91 encoders and decoders
 * Client-side only implementation without external dependencies
 */

// Base64 functions
export function base64Encode(input: string): string {
    try {
        return btoa(input);
    } catch (error) {
        throw new Error('Invalid input for Base64 encoding');
    }
}

export function base64Decode(input: string): string {
    try {
        return atob(input);
    } catch (error) {
        throw new Error('Invalid Base64 string');
    }
}

// Base91 implementation
// Base91 character set
const BASE91_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

export function base91Encode(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let output = '';
    let ebq = 0;
    let en = 0;
    
    for (let i = 0; i < bytes.length; i++) {
        ebq |= (bytes[i] & 255) << en;
        en += 8;
        
        if (en > 13) {
            let ev = ebq & 8191;
            
            if (ev > 88) {
                ebq >>= 13;
                en -= 13;
            } else {
                ev = ebq & 16383;
                ebq >>= 14;
                en -= 14;
            }
            
            output += BASE91_ALPHABET[ev % 91] + BASE91_ALPHABET[Math.floor(ev / 91)];
        }
    }
    
    if (en > 0) {
        output += BASE91_ALPHABET[ebq % 91];
        if (en > 7 || ebq > 90) {
            output += BASE91_ALPHABET[Math.floor(ebq / 91)];
        }
    }
    
    return output;
}

export function base91Decode(input: string): string {
    let decoder = new TextDecoder();
    let b = 0;
    let n = 0;
    let v = -1;
    let result: number[] = [];
    
    for (let i = 0; i < input.length; i++) {
        const c = input.charAt(i);
        const d = BASE91_ALPHABET.indexOf(c);
        
        if (d === -1) continue; // Skip characters not in the alphabet
        
        if (v < 0) {
            v = d;
        } else {
            v += d * 91;
            b |= v << n;
            n += (v & 8191) > 88 ? 13 : 14;
            
            while (n > 7) {
                result.push(b & 0xff);
                b >>= 8;
                n -= 8;
            }
            
            v = -1;
        }
    }
    
    if (v > -1) {
        result.push((b | v << n) & 0xff);
    }
    
    return decoder.decode(new Uint8Array(result));
}
