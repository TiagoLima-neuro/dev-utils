export type EncoderFormat =
  | "base64"
  | "base91"
  | "gzip"
  | "zstd"
  | "sha256-base64"
  | "sha256-hex";

export type EncoderMode = "encode" | "decode";

export function isHashFormat(format: EncoderFormat): boolean {
  return format === "sha256-base64" || format === "sha256-hex";
}

export function getEncoderFormatLabel(format: EncoderFormat): string {
  switch (format) {
    case "base64":
      return "Base64";
    case "base91":
      return "Base91";
    case "gzip":
      return "GZIP";
    case "zstd":
      return "ZSTD";
    case "sha256-base64":
      return "SHA256 (Base64)";
    case "sha256-hex":
      return "SHA256 (Hex)";
  }
}
