import {
  base64Encode,
  base64Decode,
  base91Encode,
  base91Decode,
  md5sum,
  sha256,
} from "./encoders/base.js";
import {
  gzipCompress,
  gzipDecompress,
  zstdCompress,
  zstdDecompress,
} from "./encoders/compression.js";
import {
  getEncoderFormatLabel,
  isHashFormat,
  type EncoderFormat,
  type EncoderMode,
} from "./encoders/workflow.js";
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
const encoderFormat = document.getElementById(
  "encoder-format"
) as HTMLSelectElement;
const encoderModeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("#encoder-mode-controls [data-mode]")
);
const encoderInput = document.getElementById(
  "encoder-input"
) as HTMLTextAreaElement;
const encoderOutput = document.getElementById(
  "encoder-output"
) as HTMLTextAreaElement;
const encoderRunBtn = document.getElementById(
  "encoder-run"
) as HTMLButtonElement;
const encoderSwapBtn = document.getElementById(
  "encoder-swap"
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

let currentEncoderMode: EncoderMode = "encode";

function getCurrentEncoderFormat(): EncoderFormat {
  return encoderFormat.value as EncoderFormat;
}

function updateEncoderUi() {
  const format = getCurrentEncoderFormat();
  const isHash = isHashFormat(format);

  if (isHash) {
    currentEncoderMode = "encode";
  }

  encoderModeButtons.forEach((button) => {
    const buttonMode = button.dataset.mode as EncoderMode;
    const isActive = buttonMode === currentEncoderMode;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = isHash && buttonMode === "decode";
  });

  encoderRunBtn.textContent = "Executar";
  encoderInput.placeholder = isHash
    ? "Texto para gerar o hash"
    : currentEncoderMode === "encode"
      ? "Texto para codificar"
      : `${getEncoderFormatLabel(format)} para decodificar`;
  encoderSwapBtn.disabled = encoderOutput.value.trim().length === 0;
}

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
encoderModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentEncoderMode = button.dataset.mode as EncoderMode;
    updateEncoderUi();
  });
});

encoderFormat?.addEventListener("change", () => {
  currentEncoderMode = "encode";
  updateEncoderUi();
});

encoderSwapBtn?.addEventListener("click", () => {
  if (!encoderOutput.value.trim()) {
    return;
  }

  if (isHashFormat(getCurrentEncoderFormat())) {
    encoderInput.value = encoderOutput.value;
    encoderOutput.value = "";
  } else {
    const nextInput = encoderOutput.value;
    const nextOutput = encoderInput.value;

    encoderInput.value = nextInput;
    encoderOutput.value = nextOutput;
    currentEncoderMode = currentEncoderMode === "encode" ? "decode" : "encode";
  }

  updateEncoderUi();
  encoderInput.focus();
});

encoderInput?.addEventListener("input", () => {
  updateEncoderUi();
});

encoderRunBtn?.addEventListener("click", async () => {
  const inputText = encoderInput.value;
  const format = getCurrentEncoderFormat();

  try {
    let result = "";
    const resolvedMode = isHashFormat(format) ? "hash" : currentEncoderMode;

    switch (`${format}:${resolvedMode}`) {
      case "base64:encode":
        result = base64Encode(inputText);
        break;
      case "base64:decode":
        result = base64Decode(inputText);
        break;
      case "base91:encode":
        result = base91Encode(inputText);
        break;
      case "base91:decode":
        result = base91Decode(inputText);
        break;
      case "gzip:encode":
        result = await gzipCompress(inputText);
        break;
      case "gzip:decode":
        result = await gzipDecompress(inputText);
        break;
      case "zstd:encode":
        result = await zstdCompress(inputText);
        break;
      case "zstd:decode":
        result = await zstdDecompress(inputText);
        break;
      case "md5sum:hash":
        result = md5sum(inputText);
        break;
      case "sha256-base64:hash":
        result = await sha256(inputText, "base64");
        break;
      case "sha256-hex:hash":
        result = await sha256(inputText, "hex");
        break;
      default:
        throw new Error("Invalid encoder configuration");
    }

    encoderOutput.value = result;
    updateEncoderUi();
  } catch (error) {
    encoderOutput.value = `Error: ${(error as Error).message}`;
    updateEncoderUi();
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

if (
  encoderFormat &&
  encoderInput &&
  encoderOutput &&
  encoderRunBtn &&
  encoderSwapBtn
) {
  updateEncoderUi();
}
