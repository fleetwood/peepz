function toRoman(num: number): string {
  if (!Number.isFinite(num)) return String(num)

  let n = Math.floor(num)
  if (n <= 0) return String(n)

  const map = [
    [1000, 'M'],
    [900 , 'CM'],
    [500 , 'D'],
    [400 , 'CD'],
    [100 , 'C'],
    [90  , 'XC'],
    [50  , 'L'],
    [40  , 'XL'],
    [10  , 'X'],
    [9   , 'IX'],
    [5   , 'V'],
    [4   , 'IV'],
    [1   , 'I'],
  ] as const

  let out = ''
  for (const [value, numeral] of map) {
    while (n >= value) {
      out += numeral
      n -= value
    }
  }

  return out
}

function numberToWords(num: number): string {
  if (!Number.isFinite(num)) return String(num)

  const n = Math.floor(num)
  if (n === 0) return 'zero'
  if (n < 0) return `minus ${numberToWords(Math.abs(n))}`

  const ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ] as const

  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ] as const

  const wordsUnder1000 = (value: number): string => {
    if (value < 20) return ones[value]
    if (value < 100) {
      const t = Math.floor(value / 10)
      const o = value % 10
      return o ? `${tens[t]} ${ones[o]}`.trim() : tens[t]
    }

    const h = Math.floor(value / 100)
    const r = value % 100
    return r ? `${ones[h]} hundred ${wordsUnder1000(r)}`.trim() : `${ones[h]} hundred`
  }

  if (n < 1000) return wordsUnder1000(n)
  if (n < 1_000_000) {
    const thousands = Math.floor(n / 1000)
    const rest      = n % 1000
    const left      = `${wordsUnder1000(thousands)} thousand`
    return rest ? `${left} ${wordsUnder1000(rest)}`.trim() : left
  }

  return String(n)
}

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

export function numFormat(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num) : num
  return formatter.format(n)
}

export enum NumberConvert {
  NUM,
  WRD,
  ROM
}

export function numConvert(num: number | string, convert: NumberConvert): string | number {
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num

  switch (convert) {
    case NumberConvert.NUM:
      return numValue
    case NumberConvert.WRD:
      return numberToWords(numValue)
    case NumberConvert.ROM:
      return toRoman(numValue)
    default:
      return numValue
  }
}
