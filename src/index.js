import fetchJsonp from 'fetch-jsonp';

function getSpreadsheet(id, sheetNum, isDoubleLabeled = false, withUpdated = true) {
  const url = `https://spreadsheets.google.com/feeds/list/${id}/${sheetNum}/public/values?alt=json-in-script`;  
  return new Promise((resolve, reject) => {
    fetchJsonp(url).then(function(response) {
      return response.json()
    }).then(function(json) {
      if (isDoubleLabeled) {
        const res = parseLabeledRowsCols(json.feed.entry, withUpdated);
        resolve(res);
      } else {
        const res = parseLabeledCols(json.feed.entry, withUpdated);
        resolve(res);
      }
    }).catch(function(ex) {
      reject(ex)
    })
  })
}

/**
 * Parser for table where just the columns are labeled
 * @return array of objects where the labels are keys
 */
function parseLabeledCols(entries, withUpdated) {
  return entries.map(entry => parseEntry(entry, withUpdated));
}
  
/**
 * Use for table with labels only for columns
 */
function parseEntry(entry, withUpdated) {
  const res = {};
  Object.keys(entry).forEach(key => {
    if (key.indexOf('gsx$') === 0) {
      const label = key.substr(4);
      res[label] = entry[key].$t;
    }
  });
  if (withUpdated) {
    res._updated = entry.updated.$t;
  }
  return res;
}

/**
 * Parser for table where both rows and columns are labeled
 * @return object where keys are row labels and values are objects where keys are the column labels
 */
function parseLabeledRowsCols(entries, withUpdated) {
  const res = {};
  entries.forEach(entry => {
    res[entry.title.$t] = parseLabeledRow(entry.content.$t)
    if (withUpdated) {
      res[entry.title.$t]._updated = entry.updated.$t;
    }
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

export default getSpreadsheet;