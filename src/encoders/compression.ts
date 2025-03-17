/**
 * GZIP and ZSTD compression utilities
 * Client-side only implementation using native Web APIs where possible
 */

// GZIP compression using the native CompressionStream API
export async function gzipCompress(input: string): Promise<string> {
    try {
        // Check if CompressionStream is available
        if (typeof CompressionStream === 'undefined') {
            throw new Error('CompressionStream API is not supported in this browser');
        }

        const encoder = new TextEncoder();
        const inputBytes = encoder.encode(input);
        
        // Create a compressor
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        const reader = cs.readable.getReader();
        
        // Write the input and close the stream
        await writer.write(inputBytes);
        await writer.close();
        
        // Read all chunks
        const chunks: Uint8Array[] = [];
        let result: ReadableStreamReadResult<Uint8Array>;
        
        while (true) {
            result = await reader.read();
            if (result.done) break;
            chunks.push(result.value);
        }
        
        // Concatenate the chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const compressedBytes = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of chunks) {
            compressedBytes.set(chunk, offset);
            offset += chunk.length;
        }
        
        // Convert to base64 for safe storage/transport
        return btoa(String.fromCharCode(...Array.from(compressedBytes)));
    } catch (error) {
        throw new Error(`GZIP compression failed: ${(error as Error).message}`);
    }
}

export async function gzipDecompress(input: string): Promise<string> {
    try {
        // Check if DecompressionStream is available
        if (typeof DecompressionStream === 'undefined') {
            throw new Error('DecompressionStream API is not supported in this browser');
        }

        // Convert from base64 to binary
        const binaryString = atob(input);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create a decompressor
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        const reader = ds.readable.getReader();
        
        // Write the input and close the stream
        await writer.write(bytes);
        await writer.close();
        
        // Read all chunks
        const chunks: Uint8Array[] = [];
        let result: ReadableStreamReadResult<Uint8Array>;
        
        while (true) {
            result = await reader.read();
            if (result.done) break;
            chunks.push(result.value);
        }
        
        // Concatenate the chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const decompressedBytes = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of chunks) {
            decompressedBytes.set(chunk, offset);
            offset += chunk.length;
        }
        
        // Convert back to string
        const decoder = new TextDecoder();
        return decoder.decode(decompressedBytes);
    } catch (error) {
        throw new Error(`GZIP decompression failed: ${(error as Error).message}`);
    }
}

// Since ZSTD is not natively supported in browsers, we'll implement a simplified version using an emscripten-based approach
// Note: This is a client-side only implementation using Web Assembly

// We'll create a placeholder that will indicate that proper ZSTD implementation requires WASM
// In a real implementation, this would use a WASM build of zstd-codec

let zstdInitialized = false;
let zstdInitializationPromise: Promise<void> | null = null;

// Simulate zstd initialization (in a real app this would load the WASM module)
async function initZstd(): Promise<void> {
    if (zstdInitialized) return;
    
    if (zstdInitializationPromise) {
        return zstdInitializationPromise;
    }
    
    zstdInitializationPromise = new Promise((resolve) => {
        // In a real implementation, this would load and initialize the ZSTD WASM module
        // For our demo, we'll just simulate a delay
        setTimeout(() => {
            zstdInitialized = true;
            resolve();
        }, 100);
    });
    
    return zstdInitializationPromise;
}

export async function zstdCompress(input: string): Promise<string> {
    await initZstd();
    
    // This is a placeholder. In a real implementation, this would use the ZSTD WASM module
    // For now, we'll just use base64 to demonstrate the concept
    return btoa('[ZSTD-COMPRESSED]' + input);
}

export async function zstdDecompress(input: string): Promise<string> {
    await initZstd();
    
    // This is a placeholder. In a real implementation, this would use the ZSTD WASM module
    try {
        const decoded = atob(input);
        if (!decoded.startsWith('[ZSTD-COMPRESSED]')) {
            throw new Error('Invalid ZSTD compressed data');
        }
        return decoded.substring('[ZSTD-COMPRESSED]'.length);
    } catch (error) {
        throw new Error(`ZSTD decompression failed: ${(error as Error).message}`);
    }
}
