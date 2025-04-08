import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemForm from '@/components/ItemForm.vue'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'

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

const pinia = createPinia()
setActivePinia(pinia)

const mountComponent = (props = {}) => {
  return mount(ItemForm, {
    global: {
      plugins: [i18n, pinia],
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
    const validData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }
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
    const invalidData = {
      status: 'FOR_SALE',
      title: '',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }
    wrapper = mountComponent({ title: 'Test Title', initialData: invalidData, showStatus: true })
    await flushPromises()

    const form = wrapper.find('form.item-form')
    await form.trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted().submit).toBeFalsy()
  })

  it('display error message if title exceeds max length', async () => {
    const initialData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }

    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    expect(wrapper.find('.error-message').exists()).toBe(false)

    wrapper.vm.formData.title = 'A'.repeat(51)
    await flushPromises()

    const errorWrapper = wrapper.find('.error-message')
    expect(errorWrapper.exists()).toBe(true)
    expect(errorWrapper.text()).toContain('Title cannot exceed 50 characters')
  })

  it('display location error if latitude and longitude is not provided', async () => {
    const incompleteData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: null,
      longitude: null,
      images: [],
      currentImageIndex: 0
    }

    wrapper = mountComponent({ title: 'Test Title', initialData: incompleteData, showStatus: true })
    await flushPromises()

    const locationError = wrapper.find('.error-message')
    expect(locationError.exists()).toBe(true)
    expect(locationError.text()).toContain("Please select a location")
  })

  it('handle image upload and updates formData.images', async () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'dummy-url'),
      revokeObjectURL: vi.fn()
    })

    const initialData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }
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
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'dummy-url'),
      revokeObjectURL: vi.fn()
    })

    const dummyImage = { file: {}, url: 'dummy-url' }
    const initialData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 100,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [dummyImage],
      currentImageIndex: 0
    }
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()

    await wrapper.vm.removeCurrentImage()
    await flushPromises()
    expect(wrapper.vm.formData.images.length).toBe(0)
  })

  it('display price error for negative price', async () => {
    const initialData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 0,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    wrapper.vm.formData.price = -10
    await flushPromises()

    const errorMessages = wrapper.findAll('.error-message')
    const found = errorMessages.some(err => err.text().includes('Price cannot be negative'))
    expect(found).toBe(true)
  })

  it('display price error for too high price', async () => {
    const initialData = {
      status: 'FOR_SALE',
      title: 'Test Title',
      price: 0,
      categoryId: 1,
      description: 'Test Desc',
      latitude: 10,
      longitude: 20,
      images: [],
      currentImageIndex: 0
    }
    wrapper = mountComponent({ title: 'Test Title', initialData, showStatus: true })
    await flushPromises()
    wrapper.vm.formData.price = 10000001
    await flushPromises()

    const errorMessages = wrapper.findAll('.error-message')
    const found = errorMessages.some(err => err.text().includes('Price is too high'))
    expect(found).toBe(true)
  })

})
