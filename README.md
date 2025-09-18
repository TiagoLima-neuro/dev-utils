# Dev Utils

A secure, client-side only developer utility application for internal use. This application runs entirely in the browser with no external dependencies or data transmission, making it suitable for working with sensitive data.

## Features

### Encoders & Compressors
- Base64 encoding and decoding
- Base91 encoding and decoding
- GZIP compression and decompression
- ZSTD compression and decompression (simplified implementation)

### Formatters
- JSON validation and formatting
- YAML validation and formatting

### Validators
- Brazilian CPF validation
- Brazilian CNPJ validation

## Security Features

- **100% Client-Side**: All operations are performed locally in the browser
- **No External Dependencies**: No third-party libraries or frameworks are used
- **No Data Transmission**: No data is sent over the network
- **No Storage**: No data is stored locally

## Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Building for Production

To build the application for deployment to S3:

```
npm run build
```

This will create a `dist` directory with all the necessary files for deployment.

## Deployment to S3

After building, you can deploy the contents of the `dist` directory to an S3 bucket:

1. Ensure you have AWS CLI configured
2. Run:
   ```
   aws s3 sync dist/ s3://your-bucket-name/ --acl public-read
   ```

## Technical Details

- Written in TypeScript for type safety
- No external runtime dependencies
- ES2020 module format
- Compatible with all modern browsers

## AI Enhancement Roadmap

### Planned Feature: WebLLM Integration for Parquet Query Generation

**Runtime Cost**: $0 (100% client-side, no API calls)

**Development Investment**:

| Phase | Duration | Effort | Description |
|-------|----------|--------|--------------|
| Foundation | 1 week | 20 hours | WebLLM integration, WebGPU detection, model loading |
| Core Features | 1 week | 25 hours | Schema extraction, query generation, UI integration |
| Polish & UX | 1 week | 15 hours | Error handling, loading states, performance optimization |
| Documentation | 0.5 weeks | 8 hours | User guides, system requirements, deployment updates |
| **Total** | **3.5 weeks** | **68 hours** | **Complete AI-powered parquet querying** |

**Value Proposition**:
- Transform complex filter building into natural language queries
- Maintain zero operational costs and privacy-first architecture
- Enable advanced data analysis without external dependencies
- Target ROI: 10x improvement in parquet query creation speed

**System Requirements** (for AI features):
- WebGPU-compatible browser (Chrome 113+, Edge 113+)
- 8GB+ RAM, 2GB+ available storage
- Modern GPU with 2GB+ VRAM
