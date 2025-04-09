import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from '@/stores/languageStore'
import { i18n } from '@/i18n'

const createLocalStorageMock = () => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    }
  }
}

vi.mock('@/i18n', () => {
  return {
    i18n: {
      global: {
        locale: { value: 'english' },
        availableLocales: ['english', 'norwegian']
      }
    }
  }
})

describe('languageStore', () => {
  let localStorageMock

  beforeEach(() => {
    setActivePinia(createPinia())
    
    i18n.global.locale.value = 'english'
    
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US' },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should have correct initial state', () => {
    const store = useI18nStore()
    expect(store.currentLocale).toBe('english')
  })

  it('should set locale correctly', () => {
    const store = useI18nStore()
    store.setLocale('norwegian')
    
    expect(store.currentLocale).toBe('norwegian')
    expect(i18n.global.locale.value).toBe('norwegian')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'norwegian')
  })

  it('should initialize locale from user preferences', () => {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'user') return JSON.stringify({ preferredLanguage: 'norwegian' })
      return null
    })
    
    const store = useI18nStore()
    store.initLocale()
    
    expect(store.currentLocale).toBe('norwegian')
    expect(i18n.global.locale.value).toBe('norwegian')
  })

  it('should initialize locale from saved locale if no user preference', () => {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'user') return JSON.stringify({}) 
      if (key === 'locale') return 'norwegian'
      return null
    })
    
    const store = useI18nStore()
    store.initLocale()
    
    expect(store.currentLocale).toBe('norwegian')
    expect(i18n.global.locale.value).toBe('norwegian')
  })

  it('should initialize locale from browser if no saved preference', () => {
    localStorageMock.getItem.mockImplementation(() => null)
    
    Object.defineProperty(window, 'navigator', {
      value: { language: 'no-NO' }, 
      writable: true,
      configurable: true
    })
    
    const store = useI18nStore()
    store.initLocale()
    
    expect(store.currentLocale).toBe('english')
    
    i18n.global.locale.value = 'english'
    
    Object.defineProperty(window, 'navigator', {
      value: { language: 'norwegian-NO' },
      writable: true,
      configurable: true
    })
    
    const newStore = useI18nStore()
    newStore.initLocale()
    
    expect(newStore.currentLocale).toBe('norwegian')
  })

  it('should sync with user preferences', () => {
    const store = useI18nStore()
    
    i18n.global.locale.value = 'english'
    store.setLocale('english')
    expect(store.currentLocale).toBe('english')
    
    localStorageMock.setItem.mockClear()
    
    store.syncWithUserPreferences('norwegian')
    expect(store.currentLocale).toBe('norwegian')
    expect(i18n.global.locale.value).toBe('norwegian')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'norwegian')
    
    localStorageMock.setItem.mockClear()
    store.syncWithUserPreferences('norwegian')
    expect(localStorageMock.setItem).not.toHaveBeenCalled() 
  })

  it('should respect priority order: user preference > saved locale > browser locale', () => {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'user') return JSON.stringify({ preferredLanguage: 'norwegian' })
      if (key === 'locale') return 'english'
      return null
    })
    
    const store = useI18nStore()
    store.initLocale()
    
    expect(store.currentLocale).toBe('norwegian')
    
    i18n.global.locale.value = 'english'
    
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'user') return JSON.stringify({}) 
      if (key === 'locale') return 'english'
      return null
    })
    
    store.initLocale()
    
    expect(store.currentLocale).toBe('english')
    
    i18n.global.locale.value = 'english'
    
    localStorageMock.getItem.mockImplementation(() => null) 
    
    Object.defineProperty(window, 'navigator', {
      value: { language: 'norwegian' },
      writable: true,
      configurable: true
    })
    
    store.initLocale()
    
    expect(store.currentLocale).toBe('norwegian')
  })
})