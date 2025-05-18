// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// テスト環境のフラグは削除し、実際のAPIリクエストを使用

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    }
  }
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      reload: jest.fn(),
      refresh: jest.fn(),
      forward: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      toString: jest.fn(),
    }
  },
  usePathname() {
    return ''
  }
}))

// Mock for FormData
global.FormData = class {
  append = jest.fn()
}

// Mock for URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'https://example.com')
global.URL.revokeObjectURL = jest.fn()

// Mock for window.fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)
