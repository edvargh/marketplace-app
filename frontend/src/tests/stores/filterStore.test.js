import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { 
  createFilter, 
  createCompleteFilter, 
  createPriceFilter,
  createCategoryFilter
} from '@/tests/factories/filterFactory'

describe('filterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useFilterStore()
      
      expect(store.selectedCategoryIds).toEqual([])
      expect(store.priceMin).toBe('')
      expect(store.priceMax).toBe('')
      expect(store.distanceKm).toBe('')
      expect(store.latitude).toBeNull()
      expect(store.longitude).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should set all filters when provided', () => {
      const store = useFilterStore()
      const filters = createCompleteFilter()

      store.setFilters(filters)

      expect(store.selectedCategoryIds).toEqual([1, 2, 3])
      expect(store.priceMin).toBe('10')
      expect(store.priceMax).toBe('100')
      expect(store.distanceKm).toBe('5')
      expect(store.latitude).toBe(59.9139)
      expect(store.longitude).toBe(10.7522)
    })

    it('should convert single categoryId to array of numbers', () => {
      const store = useFilterStore()
      
      store.setFilters({ categoryIds: '42' })
      expect(store.selectedCategoryIds).toEqual([42])
      
      store.setFilters({ categoryIds: 42 })
      expect(store.selectedCategoryIds).toEqual([42])
    })

    it('should convert array of categoryIds strings to numbers', () => {
      const store = useFilterStore()
      
      store.setFilters({ categoryIds: ['1', '2', '3'] })
      expect(store.selectedCategoryIds).toEqual([1, 2, 3])
    })

    it('should set empty arrays and default values when no filters provided', () => {
      const store = useFilterStore()
      
      store.setFilters(createPriceFilter())
      
      store.setFilters()
      
      expect(store.selectedCategoryIds).toEqual([])
      expect(store.priceMin).toBe('')
      expect(store.priceMax).toBe('')
      expect(store.distanceKm).toBe('')
      expect(store.latitude).toBeNull()
      expect(store.longitude).toBeNull()
    })
  })

  describe('buildFiltersQuery', () => {
    it('should build query with all filters', () => {
      const store = useFilterStore()
      
      store.setFilters(createCompleteFilter())
      
      const query = store.buildFiltersQuery()
      
      expect(query).toEqual({
        categoryIds: ['1', '2', '3'],
        minPrice: '10',
        maxPrice: '100',
        distanceKm: '5',
        latitude: 59.9139,
        longitude: 10.7522
      })
    })

    it('should only include set filters in query', () => {
      const store = useFilterStore()
      
      store.setFilters(createFilter({
        categoryIds: [1, 2],
        priceMin: '10'
        // Other filters not set
      }))
      
      const query = store.buildFiltersQuery()
      
      expect(query).toEqual({
        categoryIds: ['1', '2'],
        minPrice: '10'
      })
      
      expect(query.maxPrice).toBeUndefined()
      expect(query.distanceKm).toBeUndefined()
      expect(query.latitude).toBeUndefined()
      expect(query.longitude).toBeUndefined()
    })

    it('should merge with existing query parameters', () => {
      const store = useFilterStore()
      
      store.setFilters(createCategoryFilter([1, 2]))
      store.priceMin = '10' 
      
      const baseQuery = {
        page: 1,
        sort: 'newest',
        search: 'test'
      }
      
      const query = store.buildFiltersQuery(baseQuery)
      
      expect(query).toEqual({
        page: 1,
        sort: 'newest',
        search: 'test',
        categoryIds: ['1', '2'],
        minPrice: '10'
      })
    })

    it('should not modify the original baseQuery object', () => {
      const store = useFilterStore()
      
      store.setFilters(createPriceFilter())
      
      const baseQuery = {
        page: 1,
        sort: 'newest'
      }
      
      store.buildFiltersQuery(baseQuery)
      
      expect(baseQuery).toEqual({
        page: 1,
        sort: 'newest'
      })
    })

    it('should convert numeric categoryIds to strings in query', () => {
      const store = useFilterStore()
      
      store.setFilters(createCategoryFilter([1, 2, 3]))
      
      const query = store.buildFiltersQuery()
      
      expect(query.categoryIds).toEqual(['1', '2', '3'])
    })

    it('should not include empty categoryIds in query', () => {
      const store = useFilterStore()
      
      store.setFilters(createCategoryFilter([]))
      
      const query = store.buildFiltersQuery()
      
      expect(query.categoryIds).toBeUndefined()
    })

    it('should handle empty string values correctly', () => {
      const store = useFilterStore()
      
      store.setFilters(createFilter({
        priceMin: '',
        priceMax: '',
        distanceKm: ''
      }))
      
      const query = store.buildFiltersQuery()
      
      expect(query.minPrice).toBeUndefined()
      expect(query.maxPrice).toBeUndefined()
      expect(query.distanceKm).toBeUndefined()
    })

    it('should handle null location values correctly', () => {
      const store = useFilterStore()
      
      store.setFilters(createFilter({
        latitude: null,
        longitude: null
      }))
      
      const query = store.buildFiltersQuery()
      
      expect(query.latitude).toBeUndefined()
      expect(query.longitude).toBeUndefined()
    })

    it('should handle zero values correctly', () => {
      const store = useFilterStore()
      
      store.setFilters(createFilter({
        priceMin: '0',
        latitude: 0,
        longitude: 0
      }))
      
      const query = store.buildFiltersQuery()
      
      expect(query.minPrice).toBe('0')
      expect(query.latitude).toBe(0)
      expect(query.longitude).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined input in setFilters', () => {
      const store = useFilterStore()
      
      expect(() => store.setFilters(undefined)).not.toThrow()
      expect(store.selectedCategoryIds).toEqual([])
    })

    it('should handle null input in setFilters', () => {
      const store = useFilterStore()
      
      expect(() => store.setFilters(null)).not.toThrow()
      expect(store.selectedCategoryIds).toEqual([])
    })

    it('should handle empty object in setFilters', () => {
      const store = useFilterStore()
      
      store.setFilters({})
      expect(store.selectedCategoryIds).toEqual([])
      expect(store.priceMin).toBe('')
      expect(store.priceMax).toBe('')
      expect(store.distanceKm).toBe('')
      expect(store.latitude).toBeNull()
      expect(store.longitude).toBeNull()
    })
  })
})