/**
 * GZIP and ZSTD compression utilities
 * Client-side only implementation using native Web APIs where possible
 */
let zstdLoaded = false;

async function loadZstd() {
  if (zstdLoaded) return;
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "../wasm/zstd/zstd.js";
    script.onload = () => {
      zstdLoaded = true;
      Module.onRuntimeInitialized = () => resolve();
    };
    script.onerror = () => reject(new Error("Failed to load zstd.js"));
    document.head.appendChild(script);
  });
}
declare const Module: any;
// GZIP compression using the native CompressionStream API
export async function gzipCompress(input: string): Promise<string> {
  try {
    const byteArray = new TextEncoder().encode(input);
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(byteArray);
    writer.close();
    const compressedBuffer = await new Response(cs.readable).arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)));
  } catch (error) {
    throw new Error(`GZIP compression failed: ${(error as Error).message}`);
  }
}

export async function gzipDecompress(input: string): Promise<string> {
  try {
    if (typeof DecompressionStream === "undefined") {
      throw new Error(
        "DecompressionStream API is not supported in this browser"
      );
    }
    const compressedData = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(compressedData);
    writer.close();
    const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(decompressedBuffer);
  } catch (error) {
    throw new Error(`GZIP decompression failed: ${(error as Error).message}`);
  }
}

export async function zstdCompress(
  stringData: string,
  compressionLevel: number = 3
): Promise<string> {
  await loadZstd();
  return new Promise((resolve, reject) => {
    const data = new TextEncoder().encode(stringData);
    const dataPtr = Module._malloc(data.length);
    Module.HEAPU8.set(data, dataPtr);

    const bound = Module._ZSTD_compressBound(data.length);
    const outPtr = Module._malloc(bound);

    const compressedSize = Module._ZSTD_compress(
      outPtr,
      bound,
      dataPtr,
      data.length,
      compressionLevel
    );

    if (Module._ZSTD_isError(compressedSize)) {
      const error = Module.UTF8ToString(
        Module._ZSTD_getErrorName(compressedSize)
      );
      reject(new Error(`Compression error: ${error}`));
      return;
    }

    const compressedData = new Uint8Array(
      Module.HEAPU8.subarray(outPtr, outPtr + compressedSize)
    );

    Module._free(dataPtr);
    Module._free(outPtr);

    resolve(btoa(String.fromCharCode(...compressedData)));
  });
}

export async function zstdDecompress(
  compressedDataString: string
): Promise<string> {
  await loadZstd();
  return new Promise((resolve, reject) => {
    const compressedData = Uint8Array.from(atob(compressedDataString), (c) =>
      c.charCodeAt(0)
    );
    const compressedDataPtr = Module._malloc(compressedData.length);
    Module.HEAPU8.set(compressedData, compressedDataPtr);

    const decompressedBound = compressedData.length * 3; // a rough estimate
    const outPtr = Module._malloc(decompressedBound);

    const decompressedSize = Module._ZSTD_decompress(
      outPtr,
      decompressedBound,
      compressedDataPtr,
      compressedData.length
    );

    if (Module._ZSTD_isError(decompressedSize)) {
      const error = Module.UTF8ToString(
        Module._ZSTD_getErrorName(decompressedSize)
      );
      reject(new Error(`Decompression error: ${error}`));
      return;
    }

    const decompressedData = new Uint8Array(
      Module.HEAPU8.subarray(outPtr, outPtr + decompressedSize)
    );

    Module._free(compressedDataPtr);
    Module._free(outPtr);

    resolve(new TextDecoder().decode(decompressedData));
  });
}
