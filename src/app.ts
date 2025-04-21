import {
  base64Encode,
  base64Decode,
  base91Encode,
  base91Decode,
  sha256,
} from "./encoders/base.js";
import {
  gzipCompress,
  gzipDecompress,
  zstdCompress,
  zstdDecompress,
} from "./encoders/compression.js";
import {
  validateJson,
  formatJson,
  validateYaml,
  formatYaml,
} from "./formatters/index.js";
import { validateCPF, validateCNPJ } from "./validators/brazilian.js";
import { loadParquetFromUI } from "./parquet-view.js";
import { diffLines } from "./diff/line.js";

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Encoder elements
const encoderType = document.getElementById(
  "encoder-type"
) as HTMLSelectElement;
const encoderInput = document.getElementById(
  "encoder-input"
) as HTMLTextAreaElement;
const encoderOutput = document.getElementById(
  "encoder-output"
) as HTMLTextAreaElement;
const encoderRunBtn = document.getElementById(
  "encoder-run"
) as HTMLButtonElement;

// Formatter elements
const formatterType = document.getElementById(
  "formatter-type"
) as HTMLSelectElement;
const formatterInput = document.getElementById(
  "formatter-input"
) as HTMLTextAreaElement;
const formatterOutput = document.getElementById(
  "formatter-output"
) as HTMLTextAreaElement;
const formatterValidateBtn = document.getElementById(
  "formatter-validate"
) as HTMLButtonElement;
const formatterFormatBtn = document.getElementById(
  "formatter-format"
) as HTMLButtonElement;

// Validator elements
const validatorType = document.getElementById(
  "validator-type"
) as HTMLSelectElement;
const validatorInput = document.getElementById(
  "validator-input"
) as HTMLInputElement;
const validatorRunBtn = document.getElementById(
  "validator-run"
) as HTMLButtonElement;
const validatorResult = document.getElementById(
  "validator-result"
) as HTMLDivElement;

// Parquet elements
const parquetLoadBtn = document.getElementById(
  "parquet-load"
) as HTMLButtonElement;

// Diff elements
const diffInputOld = document.getElementById(
  "diff-input-old"
) as HTMLTextAreaElement;
const diffInputNew = document.getElementById(
  "diff-input-new"
) as HTMLTextAreaElement;
const diffOutputOld = document.getElementById(
  "diff-output-old"
) as HTMLDivElement;
const diffOutputNew = document.getElementById(
  "diff-output-new"
) as HTMLDivElement;
const diffRunBtn = document.getElementById("diff-run") as HTMLButtonElement;

// Parquet functionality
parquetLoadBtn?.addEventListener("click", loadParquetFromUI);

// Diff functionality
diffRunBtn?.addEventListener("click", () => {
  const oldText = diffInputOld.value;
  const newText = diffInputNew.value;

  try {
    const diffResult = diffLines(oldText, newText, {
      ignoreNewlineAtEof: true,
    });

    diffOutputOld.innerHTML = "";
    diffOutputNew.innerHTML = "";

    diffResult.forEach((part: { added?: any; removed?: any; value: any }) => {
      if (part.added) {
        const lineNew = document.createElement("div");
        lineNew.classList.add("diff-added");
        lineNew.textContent = part.value;
        diffOutputNew.appendChild(lineNew);
      } else if (part.removed) {
        const lineOld = document.createElement("div");
        lineOld.classList.add("diff-removed");
        lineOld.textContent = part.value;
        diffOutputOld.appendChild(lineOld);
      } else {
        const lineOld = document.createElement("div");
        lineOld.classList.add("diff-unchanged");
        lineOld.textContent = part.value;
        diffOutputOld.appendChild(lineOld);
        const lineNew = document.createElement("div");
        lineNew.classList.add("diff-unchanged");
        lineNew.textContent = part.value;
        diffOutputNew.appendChild(lineNew);
      }
    });
  } catch (error) {
    diffOutputOld.innerHTML = `<div class="diff-error">Error: ${
      (error as Error).message
    }</div>`;
    diffOutputNew.innerHTML = `<div class="diff-error">Error: ${
      (error as Error).message
    }</div>`;
  }
});

// Encoder functionality
encoderRunBtn?.addEventListener("click", async () => {
  const inputText = encoderInput.value;
  const type = encoderType.value;

  try {
    let result = "";

    switch (type) {
      case "base64-encode":
        result = base64Encode(inputText);
        break;
      case "base64-decode":
        result = base64Decode(inputText);
        break;
      case "base91-encode":
        result = base91Encode(inputText);
        break;
      case "base91-decode":
        result = base91Decode(inputText);
        break;
      case "gzip-compress":
        result = await gzipCompress(inputText);
        break;
      case "gzip-decompress":
        result = await gzipDecompress(inputText);
        break;
      case "zstd-compress":
        result = await zstdCompress(inputText);
        break;
      case "zstd-decompress":
        result = await zstdDecompress(inputText);
        break;
      case "sha256-base64":
        result = await sha256(inputText, "base64");
        break;
      case "sha256-hex":
        result = await sha256(inputText, "hex");
        break;
      default:
        throw new Error("Invalid encoder type");
    }

    encoderOutput.value = result;
  } catch (error) {
    encoderOutput.value = `Error: ${(error as Error).message}`;
  }
});

// Formatter functionality
formatterValidateBtn?.addEventListener("click", () => {
  const inputText = formatterInput.value;
  const type = formatterType.value;

  try {
    let isValid = false;

    if (type === "json") {
      isValid = validateJson(inputText);
    } else if (type === "yaml") {
      isValid = validateYaml(inputText);
    }

    formatterOutput.value = isValid
      ? "Valid!"
      : "Invalid format. Please check your input.";
  } catch (error) {
    formatterOutput.value = `Error: ${(error as Error).message}`;
  }
});

formatterFormatBtn?.addEventListener("click", () => {
  const inputText = formatterInput.value;
  const type = formatterType.value;

  try {
    let result = "";

    if (type === "json") {
      result = formatJson(inputText);
    } else if (type === "yaml") {
      result = formatYaml(inputText);
    }

    formatterOutput.value = result;
  } catch (error) {
    formatterOutput.value = `Error: ${(error as Error).message}`;
  }
});

// Validator functionality
validatorRunBtn?.addEventListener("click", () => {
  const inputText = validatorInput.value;
  const type = validatorType.value;

  try {
    let isValid = false;

    if (type === "cpf") {
      isValid = validateCPF(inputText);
    } else if (type === "cnpj") {
      isValid = validateCNPJ(inputText);
    }

    validatorResult.textContent = isValid
      ? "Valid!"
      : "Invalid. Please check your input.";
    validatorResult.className =
      "validator-result " + (isValid ? "valid" : "invalid");
  } catch (error) {
    validatorResult.textContent = `Error: ${(error as Error).message}`;
    validatorResult.className = "validator-result invalid";
  }
});
