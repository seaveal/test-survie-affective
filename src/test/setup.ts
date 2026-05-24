import '@testing-library/jest-dom/vitest'

// Polyfill IntersectionObserver pour jsdom (utilisé par Framer Motion whileInView).
// Implementation minimale : déclenche immédiatement le callback comme si l'élément
// était intersecté (les tests valident le contenu final, pas la séquence d'animation).
class IntersectionObserverMock {
  root: Element | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// @ts-expect-error – polyfill global pour jsdom (pas de définition native)
globalThis.IntersectionObserver = IntersectionObserverMock
