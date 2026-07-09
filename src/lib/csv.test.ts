import { describe, it, expect } from 'vitest'
import { parseCsv, parseCsvPaths } from './csv'

describe('parseCsv', () => {
  it('splits simple rows on both LF and CRLF', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']])
    expect(parseCsv('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']])
  })

  it('keeps commas that live inside quoted fields', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']])
  })

  it('unescapes a doubled quote inside a quoted field', () => {
    expect(parseCsv('"she said ""hi"""')).toEqual([['she said "hi"']])
  })

  it('preserves newlines inside quoted fields', () => {
    expect(parseCsv('"line1\nline2",x')).toEqual([['line1\nline2', 'x']])
  })

  it('does not emit an empty trailing row for a final newline', () => {
    expect(parseCsv('a\nb\n')).toEqual([['a'], ['b']])
  })
})

describe('parseCsvPaths', () => {
  it('takes the first column, trims it, and drops blank rows', () => {
    const csv = 'path\r\n"  /a/clip.mp4  "\r\n\r\n"/b/two.mov",ignored-second-column'
    expect(parseCsvPaths(csv)).toEqual(['path', '/a/clip.mp4', '/b/two.mov'])
  })
})
