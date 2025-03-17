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
