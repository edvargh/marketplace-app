import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemForm from '@/components/ItemForm.vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

vi.mock('@/stores/categoryStore', () => {
  return {
    useCategoryStore: () => ({
      fetchCategories: vi.fn().mockResolvedValue([
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' }
      ])
    })
  }
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      itemFormComponent: {
        status: "Status",
        category: "Category",
        title: "Title",
        description: "Description",
        price: "Price",
        selectLocation: "Please select a location",
        importImages: "Import Images",
        removeCurrentImage: "Remove Current Image",
        placeholders: {
          status: "Select status",
          category: "Select category",
          title: "Enter title",
          description: "Enter description",
          price: "Enter price"
        },
        validation: {
          invalidNumber: "Invalid number",
          negativePrice: "Price cannot be negative",
          tooHighPrice: "Price is too high"
        },
        statusOptions: {
          forSale: "For Sale",
          reserved: "Reserved",
          sold: "Sold"
        }
      }
    }
  }
})

const mountComponent = (props = {}) => {
  return mount(ItemForm, {
    global: {
      plugins: [i18n, createPinia()],
      stubs: {
        ImageGallery: true,
        SelectBox: true,
        InputBox: true,
        CustomButton: true,
        CustomTextarea: true,
        LocationDisplay: true
      }
    },
    props
  })
}

const createValidData = (overrides = {}) => ({
  status: 'FOR_SALE',
  title: 'Test Title',
  price: 100,
  categoryId: 1,
  description: 'Test Desc',
  latitude: 10,
  longitude: 20,
  images: [],
  currentImageIndex: 0,
  ...overrides
})

const stubURL = (url = 'dummy-url') => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => url),
    revokeObjectURL: vi.fn()
  })
}

describe('ItemForm.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders title from prop', async () => {
    wrapper = mountComponent({
      title: 'Test Item Form',
      initialData: { images: [], currentImageIndex: 0 }
    })
    await flushPromises()
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Test Item Form')
  })

  it('emits submit event on valid form', async () => {
    const validData = createValidData()
    wrapper = mountComponent({ title: 'Test Title', initialData: validData, showStatus: true })
    await flushPromises()

    const form = wrapper.find('form.item-form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted()).toHaveProperty('submit')
    const submitEvents = wrapper.emitted('submit')
    expect(submitEvents.length).toBeGreaterThan(0)
    const payload = submitEvents[0][0]
    expect(payload.title).toBe(validData.title)
    expect(payload.price).toBe(validData.price)
    expect(payload.categoryId).toBe(validData.categoryId)
  })

  it('does not emit submit event on invalid form', async () => {
    const invalidData = createValidData({ title: '' })
    wrapper = mountComponent({ title: 'Test Title', initialData: invalidData, showStatus: true })
    await flushPromises()

    const form = wrapper.find('form.item-form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted().submit).toBeFalsy()
  })

  it('display title error message if title exceeds max length', async () => {
    const initialData = createValidData()
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    expect(wrapper.find('.error-message').exists()).toBe(false)

    wrapper.vm.formData.title = 'A'.repeat(51)
    await flushPromises()

    const errorWrapper = wrapper.find('.error-message')
    expect(errorWrapper.exists()).toBe(true)
  })

  it('display location error if latitude and longitude is not provided', async () => {
    const incompleteData = createValidData({ latitude: null, longitude: null })
    wrapper = mountComponent({ title: 'Test Title', initialData: incompleteData, showStatus: true })
    await flushPromises()

    const locationError = wrapper.find('.error-message')
    expect(locationError.exists()).toBe(true)
    expect(locationError.text()).toContain("Please select a location")
  })

  it('handle image upload and updates formData.images', async () => {
    stubURL()
    const initialData = createValidData()
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()

    const fileInputWrapper = wrapper.find('input[type="file"]')
    expect(fileInputWrapper.exists()).toBe(true)

    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' })
    const event = {
      target: {
        files: [file]
      }
    }
    await wrapper.vm.handleImageUpload(event)
    await flushPromises()

    expect(wrapper.vm.formData.images.length).toBe(1)
    expect(wrapper.vm.formData.images[0].url).toBe('dummy-url')
  })

  it('removes current image on removeCurrentImage', async () => {
    stubURL()
    const dummyImage = { file: {}, url: 'dummy-url' }
    const initialData = createValidData({ images: [dummyImage] })
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()

    await wrapper.vm.removeCurrentImage()
    await flushPromises()
    expect(wrapper.vm.formData.images.length).toBe(0)
  })

  it('display price error for negative price', async () => {
    const initialData = createValidData()
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    wrapper.vm.formData.price = -10
    await flushPromises()

    const errorMessages = wrapper.findAll('.error-message')
    const found = errorMessages.some(err => err.text().includes('Price cannot be negative'))
    expect(found).toBe(true)
  })

  it('display price error for too high price', async () => {
    const initialData = createValidData()
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    wrapper.vm.formData.price = 10000001
    await flushPromises()

    const errorMessages = wrapper.findAll('.error-message')
    const found = errorMessages.some(err => err.text().includes('Price is too high'))
    expect(found).toBe(true)
  })

  it('trigger a click on file input when triggerFileInput is called', async () => {
    wrapper = mountComponent({ title: 'Test Title', initialData: { images: [], currentImageIndex: 0 }, showStatus: true })
    await flushPromises()
    const fileInputWrapper = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInputWrapper.element, 'click')
    wrapper.vm.triggerFileInput()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('update formData when initialData prop changes', async () => {
    const initialData = createValidData({ title: 'Initial Title' })
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    expect(wrapper.vm.formData.title).toBe('Initial Title')

    const newData = {
      ...initialData,
      title: 'Updated Title',
      description: 'Updated Desc'
    }
    await wrapper.setProps({ initialData: newData })
    await flushPromises()
    expect(wrapper.vm.formData.title).toBe('Updated Title')
    expect(wrapper.vm.formData.description).toBe('Updated Desc')
  })

  it('revokes image URLs on unmount', async () => {
    const revokeSpy = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'fake-url'),
      revokeObjectURL: revokeSpy
    })
    wrapper = mountComponent({
      initialData: {
        images: [{ file: {}, url: 'fake-url' }],
        currentImageIndex: 0
      }
    })
    await flushPromises()
    wrapper.unmount()
    expect(revokeSpy).toHaveBeenCalledWith('fake-url')
  })


  it('set no error when price is empty or null', async () => {
    const initialData = createValidData({ price: 0 })
    wrapper = mountComponent({ initialData })
    wrapper.vm.formData.price = ''
    await flushPromises()
    expect(wrapper.vm.priceError).toBe('')
  })
})
