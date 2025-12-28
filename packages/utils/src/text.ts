export const pluralize = (word: string, count?: number): string => {
  if (count === 1) return word

  const irregulars: Record<string, string> = {
    person: 'people',
    child : 'children',
    foot  : 'feet',
    tooth : 'teeth',
    goose : 'geese',
    mouse : 'mice',
  }

  if (word in irregulars) return irregulars[word]

  const oExceptions = ['mango', 'potato', 'tomato', 'echo', 'hero', 'torpedo']
  if (oExceptions.includes(word)) return word + 'es'

  if (word.endsWith('y')) {
    if (['ay', 'ey', 'oy', 'uy'].some((ending) => word.endsWith(ending))) {
      return word + 's'
    }
    return word.slice(0, -1) + 'ies'
  }

  if (/[sxz]$/.test(word) || /[cs]h$/.test(word)) {
    return word + 'es'
  }

  return word + 's'
}

export const oxfordComma = (arr: string[]): string => {
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]

  const items = [...arr]
  const last = items.pop()
  return items.join(', ') + ' and ' + last
}

export const aOrAn = (word: string): string => {
  if (!word) return 'a'
  const firstChar = word.trim().toLowerCase()[0]
  return ((['a', 'e', 'i', 'o', 'u'].includes(firstChar) ||
    (firstChar === 'h' && ['hour', 'honor', 'honest', 'heir'].includes(word.toLowerCase())))
    ? 'an '
    : 'a ') + word
}

export const capFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
