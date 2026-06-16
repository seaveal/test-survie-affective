import { describe, expect, it } from 'vitest'
import { normaliserTelephone } from './phone'

describe('normaliserTelephone', () => {
  it.each([
    ['0612345678', '+33612345678'],
    ['06 12 34 56 78', '+33612345678'],
    ['06.12.34.56.78', '+33612345678'],
    ['(06) 12-34-56-78', '+33612345678'],
    ['+33612345678', '+33612345678'],
    ['+33 6 12 34 56 78', '+33612345678'],
    ['0033612345678', '+33612345678'],
    ['+1 415 555 2671', '+14155552671'],
  ])('normalise %s -> %s', (input, expected) => {
    expect(normaliserTelephone(input)).toBe(expected)
  })

  it.each([
    ['', null],
    ['   ', null],
    ['abc', null],
    ['612345678', null], // FR sans 0 ni indicatif → on ne devine pas
    ['01234', null], // trop court
    ['+0123456789', null], // un indicatif ne peut pas commencer par 0
  ])('rejette %s', (input, expected) => {
    expect(normaliserTelephone(input)).toBe(expected)
  })
})
