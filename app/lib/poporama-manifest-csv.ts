type ManifestRow = Record<string, string>;
type ParsedManifest = { headers: string[]; rows: ManifestRow[] };
export function parseCsv(
  text: string
): ParsedManifest {
  const cleanText =
    text
      .replace(
        /^\uFEFF/,
        ""
      )
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\r/g,
        "\n"
      );

  const delimiter =
    detectDelimiter(
      cleanText
    );

  const records =
    parseDelimitedText(
      cleanText,
      delimiter
    );

  if (
    records.length ===
    0
  ) {
    return {
      headers: [],
      rows: [],
    };
  }

  const headers =
    records[0].map(
      (header) =>
        header.trim()
    );

  const rows:
    ManifestRow[] = [];

  for (
    let index = 1;
    index <
    records.length;
    index += 1
  ) {
    const record =
      records[index];

    const isEmpty =
      record.every(
        (cell) =>
          cell.trim() ===
          ""
      );

    if (isEmpty) {
      continue;
    }

    const row:
      ManifestRow = {};

    headers.forEach(
      (
        header,
        columnIndex
      ) => {
        row[header] =
          record[
            columnIndex
          ]?.trim() ??
          "";
      }
    );

    rows.push(row);
  }

  return {
    headers,
    rows,
  };
}

function detectDelimiter(
  text: string
) {
  const firstLine =
    text.split(
      "\n"
    )[0] ?? "";

  const candidates = [
    ",",
    ";",
    "\t",
  ];

  let bestDelimiter =
    ",";

  let bestCount = -1;

  for (
    const candidate of
    candidates
  ) {
    const count =
      countDelimiterOutsideQuotes(
        firstLine,
        candidate
      );

    if (
      count >
      bestCount
    ) {
      bestCount =
        count;

      bestDelimiter =
        candidate;
    }
  }

  return bestDelimiter;
}

function countDelimiterOutsideQuotes(
  line: string,
  delimiter: string
) {
  let inQuotes =
    false;

  let count = 0;

  for (
    let index = 0;
    index <
    line.length;
    index += 1
  ) {
    const char =
      line[index];

    if (
      char === '"'
    ) {
      if (
        inQuotes &&
        line[
          index + 1
        ] === '"'
      ) {
        index += 1;
      } else {
        inQuotes =
          !inQuotes;
      }
    } else if (
      char ===
        delimiter &&
      !inQuotes
    ) {
      count += 1;
    }
  }

  return count;
}

function parseDelimitedText(
  text: string,
  delimiter: string
) {
  const records:
    string[][] = [];

  let record:
    string[] = [];

  let field = "";

  let inQuotes =
    false;

  for (
    let index = 0;
    index <
    text.length;
    index += 1
  ) {
    const char =
      text[index];

    if (inQuotes) {
      if (
        char === '"'
      ) {
        if (
          text[
            index + 1
          ] === '"'
        ) {
          field += '"';

          index += 1;
        } else {
          inQuotes =
            false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (
      char === '"'
    ) {
      inQuotes = true;

      continue;
    }

    if (
      char ===
      delimiter
    ) {
      record.push(
        field
      );

      field = "";

      continue;
    }

    if (
      char === "\n"
    ) {
      record.push(
        field
      );

      records.push(
        record
      );

      record = [];

      field = "";

      continue;
    }

    field += char;
  }

  if (
    field.length > 0 ||
    record.length > 0
  ) {
    record.push(
      field
    );

    records.push(
      record
    );
  }

  return records;
}

