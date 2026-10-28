import { describe, expect, it } from 'vitest'
import en from './en.json'
import es from './es.json'
import { pickLocale } from './locale'

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj)
    .flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
    .sort()
}

describe('translations', () => {
  it('es and en have exactly the same keys', () => {
    expect(keys(en)).toEqual(keys(es))
  })

  it('no translation is empty', () => {
    const empty = (obj: object): boolean =>
      Object.values(obj).some((v) => (v && typeof v === 'object' ? empty(v) : v === ''))
    expect(empty(es)).toBe(false)
    expect(empty(en)).toBe(false)
  })
})

describe('pickLocale', () => {
  it('prefers the stored choice', () => {
    expect(pickLocale('en', 'es-ES')).toBe('en')
  })
  it('falls back to the browser language', () => {
    expect(pickLocale(null, 'en-GB')).toBe('en')
  })
  it('defaults to Spanish for unknown languages or junk', () => {
    expect(pickLocale(null, 'fr-FR')).toBe('es')
    expect(pickLocale('xx', undefined)).toBe('es')
  })
})
