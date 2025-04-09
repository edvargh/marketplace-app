import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ImageGallery from '@/components/ImageGallery.vue'

describe('ImageGallery.vue', () => {
  it('renders default image when no images are provided', async () => {
    const wrapper = mount(ImageGallery, {
      props: {
        images: [],
        altText: 'No image available'
      }
    })
    await flushPromises()
    const defaultImg = wrapper.find('img')
    expect(defaultImg.exists()).toBe(true)
    expect(defaultImg.attributes('src')).toBe('/no-image.png')
    expect(defaultImg.attributes('alt')).toBe('No image available')

    // No navigation buttons or counter appear
    expect(wrapper.find('button.nav-btn').exists()).toBe(false)
    expect(wrapper.find('.image-counter').exists()).toBe(false)
  })

  it('renders single image correctly', async () => {
    const images = ['image1.png']
    const wrapper = mount(ImageGallery, {
      props: {
        images,
        altText: 'My image'
      }
    })
    await flushPromises()

    // Show image
    const mainImg = wrapper.find('.main-image img')
    expect(mainImg.exists()).toBe(true)
    expect(mainImg.attributes('src')).toBe('image1.png')
    expect(mainImg.attributes('alt')).toBe('My image')

    // Navigation arrows and counter should not be present on one image
    expect(wrapper.find('button.nav-btn').exists()).toBe(false)
    expect(wrapper.find('.image-counter').exists()).toBe(false)
  })

  it('renders multiple images with navigation, and emits update when navigating', async () => {
    const images = ['image1.png', 'image2.png']
    const wrapper = mount(ImageGallery, {
      props: {
        images,
        altText: 'Gallery image',
        currentIndex: 0
      }
    })
    await flushPromises()

    const mainImg = wrapper.find('.main-image img')
    expect(mainImg.exists()).toBe(true)
    expect(mainImg.attributes('src')).toBe('image1.png')

    // Nav buttons and a counter should appear
    const prevBtn = wrapper.find('button.prev-btn')
    const nextBtn = wrapper.find('button.next-btn')
    expect(prevBtn.exists()).toBe(true)
    expect(nextBtn.exists()).toBe(true)
    const counter = wrapper.find('.image-counter')
    expect(counter.exists()).toBe(true)
    expect(counter.text()).toContain('1 / 2')

    await nextBtn.trigger('click')
    await flushPromises()

    // Should display second image
    expect(wrapper.find('.main-image img').attributes('src')).toBe('image2.png')
    expect(wrapper.emitted()['update:currentIndex']).toBeTruthy()
    expect(wrapper.emitted()['update:currentIndex'][0][0]).toBe(1)

    await prevBtn.trigger('click')
    await flushPromises()

    // Should display first image
    expect(wrapper.find('.main-image img').attributes('src')).toBe('image1.png')
    const emittedEvents = wrapper.emitted()['update:currentIndex']
    expect(emittedEvents[emittedEvents.length - 1][0]).toBe(0)
  })

  it('update current image when currentIndex prop changes', async () => {
    const images = ['image1.png', 'image2.png', 'image3.png']
    const wrapper = mount(ImageGallery, {
      props: {
        images,
        altText: 'Gallery image',
        currentIndex: 0
      }
    })
    await flushPromises()
    expect(wrapper.find('.main-image img').attributes('src')).toBe('image1.png')

    // Update currentIndex to 2
    await wrapper.setProps({ currentIndex: 2 })
    await flushPromises()
    expect(wrapper.find('.main-image img').attributes('src')).toBe('image3.png')
  })
})
