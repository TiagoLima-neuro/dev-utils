import { asyncBufferFromUrl, parquetReadObjects } from "./parquet/hyparquet.js";

const loadParquetData = async (
  url: string,
  columns: string[],
  rowStart: number,
  rowEnd: number
) => {
  try {
    const file = await asyncBufferFromUrl({ url });
    const data = await parquetReadObjects({
      file,
      columns: columns,
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

  if (!data) {
    container.innerHTML = "<p>No data to display.</p>";
    return;
  }

  // Create a table
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

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
      td.textContent = value as string;
      td.style.border = "1px solid black";
      td.style.padding = "8px";
      td.style.textAlign = "left";
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  container.innerHTML = ""; // Clear previous content
  container.appendChild(table);
};

(window as any).loadAndDisplayParquet = async () => {
  const url = "https://hyperparam-public.s3.amazonaws.com/bunnies.parquet";
  const columns = ["Breed Name", "Lifespan"];
  const rowStart = 10;
  const rowEnd = 20;

  const data = await loadParquetData(url, columns, rowStart, rowEnd);
  displayParquetData(data as any, "parquet-data-container");
};
