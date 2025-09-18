import { parquetQuery } from "./parquet/query.js";

const loadParquetData = async (
  file: File,
  columns: string[],
  rowStart: number,
  rowEnd: number,
  filter?: any
) => {
  try {
    const parquetFile = {
      byteLength: file.size,
      slice: async (start: number, end: number) =>
        file.slice(start, end).arrayBuffer(),
    };
    
    console.log('Calling parquetQuery with:', {
      columns: columns.length > 0 ? columns : undefined,
      rowStart,
      rowEnd,
      filter
    });
    
    const data = await parquetQuery({
      file: parquetFile,
      columns: columns.length > 0 ? columns : undefined,
      rowStart: rowStart,
      rowEnd: rowEnd,
      filter: filter,
    });

    console.log('parquetQuery returned:', data?.length, 'rows');
    if (data && data.length > 0) {
      console.log('Sample row:', data[0]);
      console.log('Column types in first row:', Object.entries(data[0]).map(([k, v]) => [k, typeof v, v]));
    }
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

const buildFilter = (column: string, operator: string, value: string) => {
  if (!column || !operator) return undefined;
  
  const parsedValue = parseValue(value);
  
  switch (operator) {
    case "equals":
      return value ? { [column]: parsedValue } : undefined;
    case "not-equals":
      return value ? { [column]: { $ne: parsedValue } } : undefined;
    case "is-null":
      return { [column]: null };
    case "not-null":
      return { [column]: { $ne: null } };
    case "gt":
      return value ? { [column]: { $gt: parsedValue } } : undefined;
    case "gte":
      return value ? { [column]: { $gte: parsedValue } } : undefined;
    case "lt":
      return value ? { [column]: { $lt: parsedValue } } : undefined;
    case "lte":
      return value ? { [column]: { $lte: parsedValue } } : undefined;
    default:
      return undefined;
  }
};

const parseValue = (value: string) => {
  if (!value) return value;
  
  // Handle boolean values
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  
  // Handle null
  if (value.toLowerCase() === "null") return null;
  
  // Try to parse as number (including integers and floats)
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    // If the number is too large for regular int, try BigInt
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      return BigInt(trimmed);
    }
    return num;
  }
  if (/^-?\d*\.\d+$/.test(trimmed)) {
    // Float
    return parseFloat(trimmed);
  }
  
  // Return as string if no other type matches
  return value;
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
  const filterColumnInput = document.getElementById(
    "parquet-filter-column"
  ) as HTMLInputElement;
  const filterOperatorInput = document.getElementById(
    "parquet-filter-operator"
  ) as HTMLSelectElement;
  const filterValueInput = document.getElementById(
    "parquet-filter-value"
  ) as HTMLInputElement;
  console.log('Filter inputs:', { filterColumnInput, filterOperatorInput, filterValueInput });
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
  
  const filterColumn = filterColumnInput?.value.trim();
  const filterOperator = filterOperatorInput?.value;
  const filterValue = filterValueInput?.value;

  // Parse columns, splitting by comma and trimming whitespace
  const columns = columnsText
    .split(",")
    .map((col) => col.trim())
    .filter((col) => col.length > 0);

  // Build filter
  const filter = buildFilter(filterColumn, filterOperator, filterValue);
  
  // Debug logging
  console.log('Filter inputs:', { filterColumn, filterOperator, filterValue });
  console.log('Parsed filter value:', parseValue(filterValue));
  console.log('Built filter:', filter);

  try {
    const data = await loadParquetData(file, columns, rowStart, rowEnd, filter);
    console.log('Loaded data length:', data?.length);
    displayParquetData(data as any[], "parquet-data-container");
  } catch (error) {
    console.error('Error details:', error);
    container.innerHTML = `<p class="error">Erro ao carregar dados: ${
      (error as Error).message
    }</p>`;
  }
};
