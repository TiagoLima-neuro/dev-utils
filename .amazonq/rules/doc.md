# Dev Utils - AI Documentation

## Project Overview

**Dev Utils** is a secure, client-side only developer utility application for internal use. All operations are performed locally in the browser with no external dependencies, data transmission, or storage, making it suitable for working with sensitive data.

## Architecture & Technology Stack

- **Language**: TypeScript (ES2020)
- **Module System**: ES2020 modules
- **Build Target**: Modern browsers supporting ES2020
- **Runtime**: 100% client-side (browser only)
- **Dependencies**: Zero external runtime dependencies
- **Security**: No data transmission, no storage, no external calls

## Project Structure

```
dev-utils/
├── src/                          # Source code
│   ├── encoders/                 # Encoding & compression utilities
│   │   ├── base.ts              # Base64, Base91, SHA256
│   │   └── compression.ts       # GZIP, ZSTD compression
│   ├── formatters/              # JSON/YAML formatters
│   │   └── index.ts            # Validation & formatting
│   ├── validators/              # Data validators
│   │   └── brazilian.ts        # CPF/CNPJ validation
│   ├── parquet/                 # Parquet file handling
│   ├── diff/                    # Text diff utilities
│   ├── wasm/                    # WebAssembly modules
│   │   └── zstd/               # ZSTD compression WASM
│   ├── assets/                  # Static assets
│   ├── *.html                   # UI pages
│   ├── styles.css              # Styling
│   └── app.ts                  # Main application logic
├── tests/                       # Test files
├── .github/workflows/           # CI/CD configuration
└── dist/                       # Build output (generated)
```

## Core Features & Modules

### 1. Encoders & Compressors (`src/encoders/`)

**Base Encoders** (`base.ts`):
- `base64Encode(input: string): string` - Standard Base64 encoding
- `base64Decode(input: string): string` - Standard Base64 decoding
- `base91Encode(input: string): string` - Base91 encoding (more efficient than Base64)
- `base91Decode(input: string): string` - Base91 decoding
- `sha256(input: string, outputType: "base64" | "hex"): Promise<string>` - SHA256 hashing

**Compression** (`compression.ts`):
- `gzipCompress(input: string): Promise<string>` - GZIP compression
- `gzipDecompress(input: string): Promise<string>` - GZIP decompression
- `zstdCompress(input: string): Promise<string>` - ZSTD compression (via WASM)
- `zstdDecompress(input: string): Promise<string>` - ZSTD decompression (via WASM)

### 2. Formatters (`src/formatters/`)

**JSON Operations**:
- `validateJson(input: string): boolean` - JSON validation
- `formatJson(input: string): string` - JSON pretty-printing

**YAML Operations** (simplified implementation):
- `validateYaml(input: string): boolean` - Basic YAML validation
- `formatYaml(input: string): string` - Basic YAML formatting

### 3. Validators (`src/validators/`)

**Brazilian Document Validators**:
- `validateCPF(cpf: string): boolean` - Brazilian CPF validation with check digits
- `validateCNPJ(cnpj: string): boolean` - Brazilian CNPJ validation with check digits

### 4. Additional Features

**Parquet Viewer** (`src/parquet/`):
- Complete Parquet file reader implementation
- Supports various encodings and compression formats
- Client-side parsing without external dependencies

**Text Diff** (`src/diff/`):
- Line-by-line text comparison
- Visual diff output with added/removed/unchanged indicators

## Build System & Deployment

### Build Configuration

**TypeScript Config** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "es2020",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Package Scripts**:
- `npm run build` - Production build (TypeScript compilation + file copying)
- `npm start` - Serve built files on port 8080
- `npm run start:dev` - Development build + serve on port 8081
- `npm test` - Run tests with tsx

### Build Process

1. **TypeScript Compilation**: `tsc --noCheck` compiles all `.ts` files to `.js`
2. **File Copying**: Copies HTML, CSS, WASM, and assets to `dist/`
3. **Output**: Ready-to-deploy static files in `dist/` directory

### Deployment Options

**S3 Deployment**:
```bash
aws s3 sync dist/ s3://your-bucket-name/ --acl public-read
```

**GitHub Pages**: Automated via GitHub Actions on push to main branch

## User Interface Structure

### Navigation
- **Encoders & Compressors** (`index.html`) - Main encoding/compression tools
- **Formatters** (`formatters.html`) - JSON/YAML validation and formatting
- **Validators** (`validators.html`) - Document validation tools
- **Parquet Viewer** (`parquet.html`) - Parquet file visualization
- **Text Diff** (`diff.html`) - Side-by-side text comparison

### UI Components
- Tab-based navigation within each page
- Input/output text areas for data processing
- Real-time validation and formatting
- Error handling with user-friendly messages

## Security & Privacy Features

1. **100% Client-Side Processing**: No server communication
2. **No External Dependencies**: All functionality implemented locally
3. **No Data Storage**: No localStorage, sessionStorage, or cookies
4. **No Network Requests**: Completely offline-capable
5. **Input Sanitization**: Proper error handling for malformed inputs

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ES2020**: Modern JavaScript features
- **Modular**: Clear separation of concerns
- **Error Handling**: Comprehensive try-catch blocks
- **Type Safety**: Full TypeScript typing

### Testing
- Test files in `tests/` directory
- Uses `tsx --test` for test execution
- Covers core functionality: encoders, validators, formatters, compression

### Adding New Features

1. **Create Module**: Add new `.ts` file in appropriate `src/` subdirectory
2. **Export Functions**: Use named exports for all public functions
3. **Update UI**: Add corresponding HTML elements and event handlers in `app.ts`
4. **Add Tests**: Create test file in `tests/` directory
5. **Update Documentation**: Update this file and README.md

## Common Operations

### Adding New Encoder
```typescript
// In src/encoders/base.ts
export function newEncode(input: string): string {
  // Implementation
}

// In src/app.ts - add to switch statement
case "new-encode":
  result = newEncode(inputText);
  break;
```

### Adding New Validator
```typescript
// In src/validators/[category].ts
export function validateNew(input: string): boolean {
  // Implementation
}

// In src/app.ts - add to validator logic
if (type === "new") {
  isValid = validateNew(inputText);
}
```

## Performance Considerations

- **WASM Usage**: ZSTD compression uses WebAssembly for performance
- **Lazy Loading**: Large operations are async to prevent UI blocking
- **Memory Management**: Large text processing handled in chunks where possible
- **Browser Compatibility**: ES2020 features require modern browsers

## Troubleshooting

### Common Issues
1. **WASM Loading**: Ensure WASM files are properly copied to dist/
2. **Module Resolution**: Check that all imports use `.js` extensions (not `.ts`)
3. **Build Failures**: Verify TypeScript compilation with `tsc --noCheck`
4. **CORS Issues**: Serve files via HTTP server, not file:// protocol

### Debug Mode
- Use browser developer tools for debugging
- Console logs available for error tracking
- Network tab should show no external requests (security verification)

## File Dependencies

### Critical Files
- `src/app.ts` - Main application logic and event handlers
- `src/encoders/base.ts` - Core encoding functions
- `src/formatters/index.ts` - JSON/YAML processing
- `src/validators/brazilian.ts` - Document validation
- `package.json` - Build configuration and scripts
- `tsconfig.json` - TypeScript compilation settings

### Build Artifacts
- `dist/` - Generated build output (do not edit directly)
- All `.js` files in `dist/` are compiled from `.ts` sources
- HTML/CSS/WASM files are copied as-is from `src/`

## Integration Points

### WebAssembly
- ZSTD compression uses `src/wasm/zstd/zstd.wasm`
- Loaded dynamically via `src/wasm/zstd/zstd.js` wrapper

### Browser APIs Used
- `crypto.subtle` for SHA256 hashing
- `TextEncoder/TextDecoder` for string/byte conversion
- `CompressionStream/DecompressionStream` for GZIP
- `btoa/atob` for Base64 operations

This documentation provides complete context for AI assistants to understand, modify, and extend the dev-utils project while maintaining its security and architectural principles.