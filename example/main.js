import SheetDone from './SheetDone';

// See: 
// https://stackoverflow.com/questions/16066839/xml-rss-feeds-drawing-from-a-google-spreadsheet
// https://coderwall.com/p/duapqq/use-a-google-spreadsheet-as-your-json-backend

// File -> publish to the web -> publish

const KEY = '1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY';

SheetDone(KEY, 1, false, true).then((data) => {
  console.log('Data');
  console.log(JSON.stringify(data));
}).catch(err => {
  console.log('Error');
  console.log(err);
})

