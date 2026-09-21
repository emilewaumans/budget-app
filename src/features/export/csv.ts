type CsvValue = string | number | boolean

function csvEscape(value: CsvValue): string {
  const str = String(value)
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(','))
  return lines.join('\r\n')
}
