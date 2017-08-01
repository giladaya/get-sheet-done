import * as GetSheetDone from './index';

/* eslint-disable max-len */
const mockJsonList = {
  feed: {
    entry: [
      {
        'id': {
          '$t': 'https://spreadsheets.google.com/feeds/list/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/cokwr'
        },
        'updated': {
          '$t': '2017-07-30T07:11:40.056Z'
        },
        'category': [
          {
            'scheme': 'http://schemas.google.com/spreadsheets/2006',
            'term': 'http://schemas.google.com/spreadsheets/2006#list'
          }
        ],
        'title': {
          'type': 'text',
          '$t': '2'
        },
        'content': {
          'type': 'text',
          '$t': 'barbat: 123, baz: 122, summary: 247'
        },
        'link': [
          {
            'rel': 'self',
            'type': 'application/atom+xml',
            'href': 'https://spreadsheets.google.com/feeds/list/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/cokwr'
          }
        ],
        'gsx$foo': {
          '$t': '2'
        },
        'gsx$barbat': {
          '$t': '123'
        },
        'gsx$baz': {
          '$t': '122'
        },
        'gsx$summary': {
          '$t': '247'
        }
      }
    ]
  }
};

const mockJsonCells = {
  feed: {
    entry: [
      {
        'id': {
          '$t': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C1'
        },
        'updated': {
          '$t': '2017-07-30T07:11:40.056Z'
        },
        'category': [
          {
            'scheme': 'http://schemas.google.com/spreadsheets/2006',
            'term': 'http://schemas.google.com/spreadsheets/2006#cell'
          }
        ],
        'title': {
          'type': 'text',
          '$t': 'A1'
        },
        'content': {
          'type': 'text',
          '$t': 'foo'
        },
        'link': [
          {
            'rel': 'self',
            'type': 'application/atom+xml',
            'href': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C1'
          }
        ],
        'gs$cell': {
          'row': '1',
          'col': '1',
          '$t': 'foo'
        }
      },
      {
        'id': {
          '$t': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C2'
        },
        'updated': {
          '$t': '2017-07-30T07:11:40.056Z'
        },
        'category': [
          {
            'scheme': 'http://schemas.google.com/spreadsheets/2006',
            'term': 'http://schemas.google.com/spreadsheets/2006#cell'
          }
        ],
        'title': {
          'type': 'text',
          '$t': 'B1'
        },
        'content': {
          'type': 'text',
          '$t': 'Bar bat'
        },
        'link': [
          {
            'rel': 'self',
            'type': 'application/atom+xml',
            'href': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C2'
          }
        ],
        'gs$cell': {
          'row': '1',
          'col': '2',
          '$t': 'Bar bat'
        }
      },
      {
        'id': {
          '$t': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C3'
        },
        'updated': {
          '$t': '2017-07-30T07:11:40.056Z'
        },
        'category': [
          {
            'scheme': 'http://schemas.google.com/spreadsheets/2006',
            'term': 'http://schemas.google.com/spreadsheets/2006#cell'
          }
        ],
        'title': {
          'type': 'text',
          '$t': 'C1'
        },
        'content': {
          'type': 'text',
          '$t': 'baz'
        },
        'link': [
          {
            'rel': 'self',
            'type': 'application/atom+xml',
            'href': 'https://spreadsheets.google.com/feeds/cells/1TLGKjwTdseCeQpr6C4uMaBuPymw3D60WUn7tHCAnYyY/1/public/values/R1C3'
          }
        ],
        'gs$cell': {
          'row': '1',
          'col': '3',
          '$t': 'baz'
        }
      }
    ]
  }
};
/* eslint-enable max-len */

describe('url builder', () => {
  it('returns correct url', () => {
    const url = GetSheetDone.buildUrl('1q2we3', 3, 'foo');
    expect(url).toBe('https://spreadsheets.google.com/feeds/foo/1q2we3/3/public/values?alt=json-in-script');
  });
});

describe('raw data', () => {
  it('returns a promise', () => {
    const fixture = GetSheetDone.raw('', 0);
    expect(typeof fixture.then).toBe('function');
  });

  it('parses data', () => {
    const res = GetSheetDone.parseRawCells(mockJsonCells.feed.entry);
    expect(res).toEqual([['foo', 'Bar bat', 'baz']]);
  });
});

describe('labeled cols', () => {
  it('returns a promise', () => {
    const fixture = GetSheetDone.labeledCols('', 0);
    expect(typeof fixture.then).toBe('function');
  });

  it('parses data', () => {
    const res = GetSheetDone.parseLabeledCols(mockJsonList.feed.entry);
    expect(res).toEqual([{
      'barbat': '123',
      'baz': '122',
      'foo': '2',
      'summary': '247',
    }]);
  });
});

describe('labeled cols and rows', () => {
  it('returns a promise', () => {
    const fixture = GetSheetDone.labeledColsRows('', 0);
    expect(typeof fixture.then).toBe('function');
  });

  it('parses data', () => {
    const res = GetSheetDone.parseLabeledRowsCols(mockJsonList.feed.entry);
    expect(res).toEqual({
      '2': {
        'barbat': '123',
        'baz': '122',
        'summary': '247',
      }
    });
  });
});
