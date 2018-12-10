export function buildUrl(id, sheetNum, mode) {
  return `https://spreadsheets.google.com/feeds/${mode}/${id}/${sheetNum}/public/values?alt=json`;
}

// Generic fetch and parse function
function fetchAndParse(id, sheetNum, type, parseEntries) {
  if (id.length === 0) {
    return Promise.reject(new Error('empty id'));
  }
  const url = buildUrl(id, sheetNum, type);
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(function (json) {
        const data = parseEntries(json.feed.entry);
        const res = {
          title: json.feed.title.$t,
          updated: json.feed.updated.$t,
          data
        };
        resolve(res);
      })
      .catch(function (ex) {
        reject(ex);
      });
  });
}

export function parseRawCells(entries) {
  const data = [];
  entries.forEach(cell => {
    const row = parseInt(cell.gs$cell.row, 10) - 1;
    const col = parseInt(cell.gs$cell.col, 10) - 1;
    const content = cell.gs$cell.$t;
    if (data[row] === undefined) {
      data[row] = [];
    }
    data[row][col] = content;
  });
  return data;
}

/**
 * Use for table with labels only for columns
 */
function parseEntry(entry) {
  const res = {};
  Object.keys(entry).forEach(key => {
    if (key.indexOf('gsx$') === 0) {
      const label = key.substr(4);
      res[label] = entry[key].$t;
    }
  });
  return res;
}

/**
 * Parser for table where just the columns are labeled
 * @return array of objects where the labels are keys
 */
export function parseLabeledCols(entries) {
  return entries.map(entry => parseEntry(entry));
}

/**
 * Use for table with labels for rows AND columns
 * Example input: "bar: 123, baz: 122, bab: 234"
 */
function parseLabeledRow(row) {
  const cols = row.split(', ');
  const res = {};
  let prevCol = null;
  cols.forEach((col, idx) => {
    const pair = col.split(': ');
    if (pair.length === 2) {
      res[pair[0]] = pair[1];
      prevCol = pair[0];
    } else if (pair.length === 1 && prevCol) {
      res[prevCol] = res[prevCol] + ', ' + pair[0];
    } else {
      // noop
    }
  });
  return res;
}

/**
 * Parser for table where both rows and columns are labeled
 * @return object where keys are row labels and values are objects where keys are the column labels
 */
export function parseLabeledRowsCols(entries) {
  const res = {};
  entries.forEach(entry => {
    res[entry.title.$t] = parseLabeledRow(entry.content.$t);
  });
  return res;
}

// fetch as raw arrays
export function raw(id, sheetNum = 1) {
  return fetchAndParse(id, sheetNum, 'cells', parseRawCells);
}

// fetch as array of labeled columns
export function labeledCols(id, sheetNum = 1) {
  return fetchAndParse(id, sheetNum, 'list', parseLabeledCols);
}

// fetch as labeled map of labeled columns
export function labeledColsRows(id, sheetNum = 1) {
  return fetchAndParse(id, sheetNum, 'list', parseLabeledRowsCols);
}

export default {
  raw,
  labeledCols,
  labeledColsRows
};
