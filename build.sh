#!/bin/bash

# Build script for Dev Utils
# This script compiles TypeScript and prepares files for S3 deployment

echo "Building Dev Utils for production..."

# Ensure dist directory exists and is empty
rm -rf dist
mkdir -p dist

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc

# Copy HTML and CSS files
echo "Copying static files..."
cp src/*.html dist/
cp src/*.css dist/
cp -r src/wasm dist/wasm
cp src/wasm/**/*.wasm dist/
rm dist/wasm/**/*.wasm
echo "Build complete! Files are ready in the dist directory for S3 deployment."
echo "To deploy to S3, use: aws s3 sync dist/ s3://your-bucket-name/ --acl public-read"
