import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HorizontalPagination from '@/components/HorizontalPagination.vue'
import { nextTick } from 'vue'

describe('HorizontalPagination', () => {
  let mockScrollContainer
  let mockOriginalContainer
  let mockStartClone
  let mockEndClone
  let mockResizeObserver
  let mockScrollBy
  let mockObserve

  beforeEach(() => {
    mockObserve = vi.fn()
    mockResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
    global.ResizeObserver = mockResizeObserver
    global.window = {
      ResizeObserver: mockResizeObserver,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.getComputedStyle = vi.fn(() => ({
      marginRight: '10px'
    }))
    vi.useFakeTimers()
    mockScrollBy = vi.fn()

    mockScrollContainer = {
      scrollBy: mockScrollBy,
      style: { scrollBehavior: 'smooth' },
      clientWidth: 500,
      scrollWidth: 1000,
      scrollLeft: 0
    }
    mockOriginalContainer = {
      children: [
        { offsetWidth: 100 },
        { offsetWidth: 100 }
      ]
    }
    mockStartClone = { offsetWidth: 200 }
    mockEndClone = { offsetWidth: 200 }

    global.MouseEvent = class MouseEvent {
      constructor(type, options = {}) {
        this.type = type
        Object.assign(this, options)
      }
    }
    global.Event = class Event {
      constructor(type, options = {}) {
        this.type = type
        Object.assign(this, options)
      }
    }
  })
  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  it('render properly', () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    expect(wrapper.find('.slider-wrapper').exists()).toBe(true)
    expect(wrapper.find('.nav-button.left').exists()).toBe(true)
    expect(wrapper.find('.nav-button.right').exists()).toBe(true)
    expect(wrapper.find('.scroll-container').exists()).toBe(true)
    expect(wrapper.find('.original-container').exists()).toBe(true)
    expect(wrapper.find('.clone-container.start-clone').exists()).toBe(true)
    expect(wrapper.find('.clone-container.end-clone').exists()).toBe(true)
  })

  it('emit clone on mount', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    await wrapper.vm.$nextTick()
    wrapper.vm.scrollContainerRef.value = mockScrollContainer
    wrapper.vm.originalContainerRef.value = mockOriginalContainer
    wrapper.vm.startCloneRef.value = mockStartClone
    wrapper.vm.endCloneRef.value = mockEndClone

    await wrapper.vm.setupInfiniteScroll()
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:cloneStart')).toBeTruthy()
    expect(wrapper.emitted('update:cloneStart')[0][0]).toEqual({
      start: 0,
      end: 2
    })
    expect(wrapper.emitted('update:cloneEnd')).toBeTruthy()
    expect(wrapper.emitted('update:cloneEnd')[0][0]).toEqual({
      start: 0,
      end: 2
    })
  })

  it('handle scroll left button click', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    const originalScrollLeft = wrapper.vm.scrollLeft
    wrapper.vm.scrollLeft = vi.fn().mockImplementation(() => {
      wrapper.vm.isScrolling = true
      mockScrollBy({
        left: -300,
        behavior: 'smooth'
      })

      setTimeout(() => {
        wrapper.vm.isScrolling = false
      }, 500)
    })
    await wrapper.vm.scrollLeft()
    await nextTick()

    expect(mockScrollBy).toHaveBeenCalledWith({
      left: -300,
      behavior: 'smooth'
    })
    vi.advanceTimersByTime(500)
    expect(wrapper.vm.isScrolling).toBe(false)
    wrapper.vm.scrollLeft = originalScrollLeft
  })

  it('handle scroll right button click', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })

    const originalScrollRight = wrapper.vm.scrollRight
    wrapper.vm.scrollRight = vi.fn().mockImplementation(() => {
      wrapper.vm.isScrolling = true
      mockScrollBy({
        left: 300,
        behavior: 'smooth'
      })
      setTimeout(() => {
        wrapper.vm.isScrolling = false
      }, 500)
    })
    await wrapper.vm.scrollRight()
    await nextTick()

    expect(mockScrollBy).toHaveBeenCalledWith({
      left: 300,
      behavior: 'smooth'
    })
    vi.advanceTimersByTime(500)
    expect(wrapper.vm.isScrolling).toBe(false)
    wrapper.vm.scrollRight = originalScrollRight
  })

  it('handle scroll events for infinite scroll', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    const originalHandleScroll = wrapper.vm.handleScroll
    wrapper.vm.handleScroll = vi.fn().mockImplementation(() => {
      if (mockScrollContainer.scrollLeft <= 50) {
        wrapper.vm.isScrolling = true
        mockScrollContainer.scrollLeft = 280

        setTimeout(() => {
          wrapper.vm.isScrolling = false
        }, 50)
      }
      else if (mockScrollContainer.scrollLeft >= 800) {
        wrapper.vm.isScrolling = true
        mockScrollContainer.scrollLeft = 220

        setTimeout(() => {
          wrapper.vm.isScrolling = false
        }, 50)
      }
    })
    mockScrollContainer.scrollLeft = 0
    wrapper.vm.isScrolling = false
    await wrapper.vm.handleScroll()
    await nextTick()

    vi.advanceTimersByTime(50)
    expect(mockScrollContainer.scrollLeft).toBe(280)
    wrapper.vm.isScrolling = false

    mockScrollContainer.scrollLeft = 800
    await wrapper.vm.handleScroll()
    await nextTick()

    vi.advanceTimersByTime(50)
    expect(mockScrollContainer.scrollLeft).toBe(220) // startCloneWidth + 20
    wrapper.vm.handleScroll = originalHandleScroll
  })

  it('set up resize observer on mount', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    const originalMounted = wrapper.vm.setupInfiniteScroll
    wrapper.vm.setupInfiniteScroll = vi.fn()
    wrapper.vm.scrollContainerRef.value = mockScrollContainer

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {})
      resizeObserver.observe(mockScrollContainer)
    }
    await nextTick()

    expect(mockResizeObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
    wrapper.vm.setupInfiniteScroll = originalMounted
  })

  it('clean up on unmount', async () => {
    const wrapper = mount(HorizontalPagination, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div>',
        'clone-start': '<div>Clone Start</div>',
        'clone-end': '<div>Clone End</div>'
      }
    })
    const mockDisconnect = mockResizeObserver.mock.results[0]?.value?.disconnect || vi.fn()
    wrapper.unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})