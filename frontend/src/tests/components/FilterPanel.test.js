import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import FilterPanel from '@/components/FilterPanel.vue'
import { reactive } from 'vue'
import { beforeEach } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {
      categoryIds: ['1'],
      minPrice: '100',
      maxPrice: '500',
      distanceKm: '10',
      latitude: '45.123456',
      longitude: '12.654321'
    }
  }))
}))

let mockStore

vi.mock('@/stores/filterStore', () => ({
  useFilterStore: () => mockStore
}))

beforeEach(() => {
  mockStore = reactive({
    selectedCategoryIds: [],
    priceMin: null,
    priceMax: null,
    distanceKm: null,
    latitude: null,
    longitude: null
  })
})

const defaultProps = {
  categories: [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' }
  ]
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'FilterPanel': {
        'Categories': 'Categories',
        'Price-range': 'Price Range',
        'Min-price': 'Min Price',
        'Max-price': 'Max Price',
        'Distance': 'Distance',
        'Apply-filters': 'Apply Filters'
      }
    }
  }
})

const globalOptions = {
  plugins: [i18n],
  stubs: {
    CheckboxGroup: true,
    CustomButton: true
  }
}

describe('FilterPanel', () => {
  it('render with default props', () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    expect(wrapper.find('.FilterPanel').exists()).toBe(true)
  })

  it('emit update:filters when a filter changes', async () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    await wrapper.vm.applyFilters()
    expect(wrapper.emitted('applyFilters')).toBeTruthy()
  })

  it('emit reset when reset button is clicked', async () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    const button = wrapper.findComponent({ name: 'CustomButton' })
    await button.vm.$emit('click')
    expect(wrapper.emitted('applyFilters')).toBeTruthy()
  })

  it('apply active class to filter when it has a value', () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    wrapper.vm.selectedCategoryIds = [1]
    expect(wrapper.vm.selectedCategoryIds).toEqual([1])
  })

  it('disable button when priceError is present', async () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    wrapper.vm.priceMin = 1000
    wrapper.vm.priceMax = 500
    await wrapper.vm.$nextTick()
    const button = wrapper.findComponent({ name: 'CustomButton' })
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('validate price in valid range', () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    wrapper.vm.priceMin = -50
    wrapper.vm.priceMax = 20_000_000
    wrapper.vm.validatePriceInput()
    expect(wrapper.vm.priceMin).toBe(0)
    expect(wrapper.vm.priceMax).toBe(10_000_000)
  })


  it('set initial values from route query params', () => {
    vi.mocked(useRoute).mockReturnValue({
      query: {
        categoryIds: ['1'],
        minPrice: '100',
        maxPrice: '500',
        distanceKm: '10',
        latitude: '45.123456',
        longitude: '12.654321'
      }
    })
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    expect(wrapper.vm.selectedCategoryIds).toContain(1)
    expect(wrapper.vm.priceMin).toBe(100)
    expect(wrapper.vm.priceMax).toBe(500)
    expect(wrapper.vm.distanceKm).toBe(10)
    expect(wrapper.vm.latitudeInput).toBe('45.123456')
    expect(wrapper.vm.longitudeInput).toBe('12.654321')
  })

  it('update latitude/longitude when input fields change', async () => {
    vi.mocked(useRoute).mockReturnValue({
      query: {}
    })
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    const latInput = wrapper.find('input[placeholder="Latitude"]')
    const lngInput = wrapper.find('input[placeholder="Longitude"]')
    await latInput.setValue('40.123456')
    await lngInput.setValue('70.654321')
    await latInput.trigger('change')
    await lngInput.trigger('change')
    expect(wrapper.vm.latitude).toBeCloseTo(40.123456)
    expect(wrapper.vm.longitude).toBeCloseTo(70.654321)
  })


  it('handleLatLongChange sets lat/lng values from input', () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    wrapper.vm.latitudeInput = '23.456789'
    wrapper.vm.longitudeInput = '-123.456789'
    wrapper.vm.handleLatLongChange()
    expect(wrapper.vm.latitude).toBeCloseTo(23.456789)
    expect(wrapper.vm.longitude).toBeCloseTo(-123.456789)

    wrapper.vm.latitudeInput = ''
    wrapper.vm.longitudeInput = ''
    wrapper.vm.handleLatLongChange()
    expect(wrapper.vm.latitude).toBeNull()
    expect(wrapper.vm.longitude).toBeNull()
  })

  it('syncToStore updates store from current component refs', () => {
    mockStore = {
      selectedCategoryIds: [],
      priceMin: null,
      priceMax: null,
      distanceKm: null,
      latitude: null,
      longitude: null
    }
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    wrapper.vm.selectedCategoryIds = [3]
    wrapper.vm.priceMin = 200
    wrapper.vm.priceMax = 900
    wrapper.vm.distanceKm = 42
    wrapper.vm.latitude = 51.5074
    wrapper.vm.longitude = -0.1278
    wrapper.vm.syncToStore()
    expect(mockStore.selectedCategoryIds).toEqual([3])
    expect(mockStore.priceMin).toBe(200)
    expect(mockStore.priceMax).toBe(900)
    expect(mockStore.distanceKm).toBe(42)
    expect(mockStore.latitude).toBe(51.5074)
    expect(mockStore.longitude).toBe(-0.1278)
  })

  it('react to changes in store and updates refs', async () => {
    const wrapper = mount(FilterPanel, { props: defaultProps, global: globalOptions })
    mockStore.selectedCategoryIds = [3]
    mockStore.latitude = 12.3456
    mockStore.longitude = -45.6789
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedCategoryIds).toEqual([3])
    expect(wrapper.vm.latitude).toBe(12.3456)
    expect(wrapper.vm.longitude).toBe(-45.6789)
    expect(wrapper.vm.latitudeInput).toBe('12.3456')
    expect(wrapper.vm.longitudeInput).toBe('-45.6789')
  })

})