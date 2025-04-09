import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import LocationDisplay from '@/components/LocationDisplay.vue'
import L from 'leaflet'

vi.spyOn(L, 'map').mockImplementation((element, options) => {
  return {
    setView: vi.fn().mockReturnThis(),
    on: vi.fn(),
    invalidateSize: vi.fn()
  }
})
vi.spyOn(L, 'tileLayer').mockImplementation(() => {
  return { addTo: vi.fn() }
})
vi.spyOn(L, 'marker').mockImplementation((latLng, options) => {
  return {
    addTo: vi.fn(),
    setLatLng: vi.fn(),
    bindPopup: vi.fn().mockReturnThis(),
    openPopup: vi.fn(),
    closePopup: vi.fn(),
    on: vi.fn()
  }
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      locationDisplay: {
        title: "Location",
        latitude: "Latitude",
        longitude: "Longitude",
        useCurrentLocation: "Use my current location",
        errors: {
          unsupported: "Geolocation not supported",
          general: "Unable to retrieve location",
          denied: "Permission denied",
          unavailable: "Location unavailable",
          timeout: "Request timed out"
        }
      }
    }
  }
})

const pinia = createPinia()

const mountComponent = (props = {}) => {
  return mount(LocationDisplay, {
    global: {
      plugins: [i18n, pinia]
    },
    props
  })
}

describe('LocationDisplay.vue', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  it('renders title and map container', async () => {
    wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.find('h3').text()).toBe("Location")
    expect(wrapper.find('.map-container').exists()).toBe(true)
  })

  it('show coordinates if lat and lng are provided', async () => {
    wrapper = mountComponent({ lat: 10.123, lng: 20.456 })
    await flushPromises()
    const coordsDisplay = wrapper.find('.coordinates-display')
    expect(coordsDisplay.exists()).toBe(true)
    expect(coordsDisplay.text()).toContain("Latitude: 10.123")
    expect(coordsDisplay.text()).toContain("Longitude: 20.456")
  })

  it('not showing coordinates when lat and lng are null', async () => {
    wrapper = mountComponent({ lat: null, lng: null })
    await flushPromises()
    expect(wrapper.find('.coordinates-display').exists()).toBe(false)
  })

  it('shows "Use my current location" button in edit mode', async () => {
    wrapper = mountComponent({ isEditMode: true })
    await flushPromises()
    const button = wrapper.find('.my-location-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe("Use my current location")
  })

  it('does not show "Use my current location" button when not in edit mode', async () => {
    wrapper = mountComponent({ isEditMode: false })
    await flushPromises()
    const button = wrapper.find('.my-location-button')
    expect(button.exists()).toBe(false)
  })

  it('emits update events when updateLocation is called', async () => {
    wrapper = mountComponent({ lat: null, lng: null })
    await flushPromises()
    wrapper.vm.updateLocation(15, 25)
    await flushPromises()

    const emittedLat = wrapper.emitted()['update:lat']
    const emittedLng = wrapper.emitted()['update:lng']

    expect(emittedLat).toBeTruthy()
    expect(emittedLat[0]).toEqual([15])
    expect(emittedLng).toBeTruthy()
    expect(emittedLng[0]).toEqual([25])
  })

  it('calls useCurrentLocation and updates location on success', async () => {
    const fakePosition = { coords: { latitude: 30.0, longitude: 40.0 } }
    const getCurrentPositionMock = vi.fn((success, error, options) => {
      success(fakePosition)
    })
    navigator.geolocation = { getCurrentPosition: getCurrentPositionMock }

    wrapper = mountComponent({ isEditMode: true })
    await flushPromises()
    await wrapper.vm.useCurrentLocation()
    await flushPromises()

    const emittedLat = wrapper.emitted()['update:lat']
    const emittedLng = wrapper.emitted()['update:lng']

    expect(getCurrentPositionMock).toHaveBeenCalled()
    expect(emittedLat).toBeTruthy()
    expect(emittedLat[0]).toEqual([30.0])
    expect(emittedLng).toBeTruthy()
    expect(emittedLng[0]).toEqual([40.0])
  })

  it('display geolocation error when useCurrentLocation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const fakeError = { code: 1 };
    const getCurrentPositionMock = vi.fn((success, error, options) => {
      error(fakeError);
    });
    navigator.geolocation = { getCurrentPosition: getCurrentPositionMock };

    wrapper = mountComponent({ isEditMode: true });
    await flushPromises();
    await wrapper.vm.useCurrentLocation();
    await flushPromises();
    const errorMsg = wrapper.find('.error-message').text();
    expect(errorMsg).toBe("Permission denied");
  })

  it('display "Location unavailable" error on geolocation code 2', async () => {
    const fakeError = { code: 2 }
    navigator.geolocation.getCurrentPosition = vi.fn((s, e) => e(fakeError))

    wrapper = mountComponent({ isEditMode: true })
    await wrapper.vm.useCurrentLocation()
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toBe("Location unavailable")
  })

  it('display "Request timed out" error on geolocation code 3', async () => {
    const fakeError = { code: 3 }
    navigator.geolocation.getCurrentPosition = vi.fn((s, e) => e(fakeError))

    wrapper = mountComponent({ isEditMode: true })
    await wrapper.vm.useCurrentLocation()
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toBe("Request timed out")
  })
})
