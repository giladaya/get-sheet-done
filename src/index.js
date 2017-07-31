import fetchJsonp from 'fetch-jsonp';

export function buildUrl(id, sheetNum, mode) {
  return `https://spreadsheets.google.com/feeds/${mode}/${id}/${sheetNum}/public/values?alt=json-in-script`;  
}

export function raw(id, sheetNum) {
  const url = buildUrl(id, sheetNum, 'cells');
  return new Promise((resolve, reject) => {
    fetchJsonp(url).then(function(response) {
      return response.json()
    }).then(function(json) {
      const data = parseRawCells(json.feed.entry);
      const res = {
        title: json.feed.title.$t,
        updated: json.feed.updated.$t,
        data
      }
      resolve(res);
    }).catch(function(ex) {
      reject(ex)
    })
  })
}

export function parseRawCells(entries) {
  const data = []
  entries.forEach(cell => {
    const row = parseInt(cell.gs$cell.row) - 1;
    const col = parseInt(cell.gs$cell.col) - 1;
    const content = cell.gs$cell.$t;
    if (data[row] === undefined) {
      data[row] = [];
    }
    data[row][col] = content;
  })
  return data;
}

export function labeledCols(id, sheetNum) {
  const url = buildUrl(id, sheetNum, 'list');
  return new Promise((resolve, reject) => {
    fetchJsonp(url).then(function(response) {
      return response.json()
    }).then(function(json) {
      const data = parseLabeledCols(json.feed.entry);
      const res = {
        title: json.feed.title.$t,
        updated: json.feed.updated.$t,
        data
      }
      resolve(res);
    }).catch(function(ex) {
      reject(ex)
    })
  })
}

/**
 * Parser for table where just the columns are labeled
 * @return array of objects where the labels are keys
 */
function parseLabeledCols(entries) {
  return entries.map(entry => parseEntry(entry));
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

export function labeledColsRows(id, sheetNum) {
  const url = buildUrl(id, sheetNum, 'list');
  return new Promise((resolve, reject) => {
    fetchJsonp(url).then(function(response) {
      return response.json()
    }).then(function(json) {
      const data = parseLabeledRowsCols(json.feed.entry);
      const res = {
        title: json.feed.title.$t,
        updated: json.feed.updated.$t,
        data
      }
      resolve(res);
    }).catch(function(ex) {
      reject(ex)
    })
  })
}

/**
 * Parser for table where both rows and columns are labeled
 * @return object where keys are row labels and values are objects where keys are the column labels
 */
function parseLabeledRowsCols(entries) {
  const res = {};
  entries.forEach(entry => {
    res[entry.title.$t] = parseLabeledRow(entry.content.$t)
  })
  return res;
}

/** 
 * Use for table with labels for rows AND columns
 * Example input: "bar: 123, baz: 122, bab: 234"
 */
function parseLabeledRow(row) {
  const cols = row.split(', ');
  const res = cols.reduce((acc, col) => {
    const pair = col.split(': ');
    acc[pair[0]] = pair[1];
    return acc;
  }, {});
  return res;
}

export default {
  raw,
  labeledCols,
  labeledColsRows
};