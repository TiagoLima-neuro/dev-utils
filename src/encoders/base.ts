/**
 * Base64 and Base91 encoders and decoders
 * Client-side only implementation without external dependencies
 */

function toBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(input: string): Uint8Array {
  const normalizedInput = input.replace(/\s+/g, "");
  const binary = atob(normalizedInput);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

// Base64 functions
export function base64Encode(input: string): string {
  try {
    return toBase64(new TextEncoder().encode(input));
  } catch (error) {
    throw new Error("Invalid input for Base64 encoding");
  }
}

export function base64Decode(input: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(fromBase64(input));
  } catch (error) {
    throw new Error("Invalid Base64 string");
  }
}

// Base91 implementation
// Base91 character set
const BASE91_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

export function base91Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let output = "";
  let ebq = 0;
  let en = 0;

  for (const element of bytes) {
    ebq |= (element & 255) << en;
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
    result.push((b | (v << n)) & 0xff);
  }

  return decoder.decode(new Uint8Array(result));
}

function leftRotate(value: number, amount: number): number {
  return ((value << amount) | (value >>> (32 - amount))) >>> 0;
}

function toLittleEndianHex(word: number): string {
  const bytes = [
    word & 0xff,
    (word >>> 8) & 0xff,
    (word >>> 16) & 0xff,
    (word >>> 24) & 0xff,
  ];

  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const MD5_SHIFT_AMOUNTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_TABLE = Array.from({ length: 64 }, (_, index) =>
  Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
);

export function md5sum(input: string): string {
  const source = new TextEncoder().encode(input);
  const paddedLength = (((source.length + 8) >>> 6) + 1) * 64;
  const padded = new Uint8Array(paddedLength);
  const bitLength = BigInt(source.length) * 8n;

  padded.set(source);
  padded[source.length] = 0x80;

  for (let index = 0; index < 8; index++) {
    padded[padded.length - 8 + index] = Number(
      (bitLength >> BigInt(index * 8)) & 0xffn
    );
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let chunkOffset = 0; chunkOffset < padded.length; chunkOffset += 64) {
    const words = new Uint32Array(16);

    for (let wordIndex = 0; wordIndex < 16; wordIndex++) {
      const byteOffset = chunkOffset + wordIndex * 4;
      words[wordIndex] =
        padded[byteOffset] |
        (padded[byteOffset + 1] << 8) |
        (padded[byteOffset + 2] << 16) |
        (padded[byteOffset + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index++) {
      let f = 0;
      let g = 0;

      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }

      const nextValue = (a + f + MD5_TABLE[index] + words[g]) >>> 0;

      a = d;
      d = c;
      c = b;
      b = (b + leftRotate(nextValue, MD5_SHIFT_AMOUNTS[index])) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return (
    toLittleEndianHex(a0) +
    toLittleEndianHex(b0) +
    toLittleEndianHex(c0) +
    toLittleEndianHex(d0)
  );
}

// SHA256 Hash function
export async function sha256(
  input: string,
  outputType: "base64" | "hex"
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  if (outputType === "base64") {
    return toBase64(new Uint8Array(hashBuffer));
  }

  // Hex output
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
