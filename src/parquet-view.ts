import { parquetReadObjects } from "./parquet/hyparquet.js";

const loadParquetData = async (
  file: File,
  columns: string[],
  rowStart: number,
  rowEnd: number
) => {
  try {
    const parquetFile = {
      byteLength: file.size,
      slice: async (start: number, end: number) =>
        file.slice(start, end).arrayBuffer(),
    };
    const data = await parquetReadObjects({
      file: parquetFile,
      columns: columns.length > 0 ? columns : undefined,
      rowStart: rowStart,
      rowEnd: rowEnd,
    });

    return data;
  } catch (error) {
    console.error("Error loading parquet data:", error);
    return null;
  }
};

const displayParquetData = (data: any[], containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No data to display.</p>";
    return;
  }

  // Create a table
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.classList.add("parquet-table");

  // Create table header
  if (data.length > 0) {
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      th.style.border = "1px solid black";
      th.style.padding = "8px";
      th.style.textAlign = "left";
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
  }

  // Create table rows
  data.forEach((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    const row = document.createElement("tr");
    Object.values(item).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value !== null ? String(value) : "null";
      td.style.border = "1px solid black";
      td.style.padding = "8px";
      td.style.textAlign = "left";
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  container.innerHTML = ""; // Clear previous content
  container.appendChild(table);

  // Add row count information
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("parquet-info");
  infoDiv.textContent = `Exibindo ${data.length} linha(s)`;
  container.appendChild(infoDiv);
};

// Function to be called from the UI
export const loadParquetFromUI = async () => {
  const fileInput = document.getElementById("parquet-file") as HTMLInputElement;
  const columnsInput = document.getElementById(
    "parquet-columns"
  ) as HTMLInputElement;
  const rowStartInput = document.getElementById(
    "parquet-row-start"
  ) as HTMLInputElement;
  const rowEndInput = document.getElementById(
    "parquet-row-end"
  ) as HTMLInputElement;
  const container = document.getElementById("parquet-data-container");

  if (!fileInput || !rowStartInput || !rowEndInput || !container) {
    console.error("Missing UI elements");
    return;
  }

  // Show loading indicator
  container.innerHTML = "<p>Carregando dados...</p>";

  const file = fileInput.files?.[0];
  if (!file) {
    container.innerHTML = '<p class="error">Arquivo não selecionado</p>';
    return;
  }

  const columnsText = columnsInput.value.trim();
  const rowStart = parseInt(rowStartInput.value, 10) || 0;
  const rowEnd = parseInt(rowEndInput.value, 10) || 20;

  // Parse columns, splitting by comma and trimming whitespace
  const columns = columnsText
    .split(",")
    .map((col) => col.trim())
    .filter((col) => col.length > 0);

  try {
    const data = await loadParquetData(file, columns, rowStart, rowEnd);
    displayParquetData(data as any[], "parquet-data-container");
  } catch (error) {
    container.innerHTML = `<p class="error">Erro ao carregar dados: ${
      (error as Error).message
    }</p>`;
  }
};
