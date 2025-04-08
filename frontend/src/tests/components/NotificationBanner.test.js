import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import NotificationBanner from '@/components/NotificationBanner.vue' // Adjust the path
import { nextTick } from 'vue'

let clock

beforeEach(() => {
  clock = vi.useFakeTimers()
})

afterEach(() => {
  clock.clearAllTimers()
  vi.useRealTimers()
})

describe('NotificationBanner.vue', () => {
  it('renders message and correct type class', async () => {
    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Test!',
        type: 'success'
      }
    })
    await nextTick()
    expect(wrapper.text()).toContain('Test!')
    expect(wrapper.find('.popup-content').classes()).toContain('success')
  })

  it('shows close button when showClose is true', async () => {
    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Test',
        showClose: true
      }
    })
    await nextTick()
    const closeBtn = wrapper.find('.close-btn')
    expect(closeBtn.exists()).toBe(true)
  })

  it('banner hides after clicking close button and emits events', async () => {
    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Test',
        showClose: true
      }
    })
    await nextTick()
    await wrapper.find('.close-btn').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('timeout-complete')).toBeTruthy()
  })

  it('closes when clicking on overlay if autoClose is true', async () => {
    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Test',
        autoClose: true
      }
    })
    await nextTick()
    await wrapper.find('.popup-overlay').trigger('click')

    expect(wrapper.vm.isVisible).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not close when clicking on overlay if autoClose is false', async () => {
    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Overlay test',
        autoClose: false
      }
    })
    await nextTick()
    await wrapper.find('.popup-overlay').trigger('click')

    expect(wrapper.vm.isVisible).toBe(true)
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('auto-closes after timeout and emits events', async () => {
    vi.useFakeTimers()

    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Test',
        autoClose: true,
        timeout: 3000
      }
    })
    await nextTick()
    expect(wrapper.find('.popup-overlay').exists()).toBe(true)

    vi.advanceTimersByTime(3000)
    await nextTick()

    expect(wrapper.vm.isVisible).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('timeout-complete')).toBeTruthy()

    vi.useRealTimers()
  })


  it('does not auto-close if autoClose is false', async () => {
    vi.useFakeTimers()

    const wrapper = mount(NotificationBanner, {
      props: {
        message: 'Persistent',
        autoClose: false,
        timeout: 3000
      }
    })
    vi.advanceTimersByTime(3000)
    await nextTick()

    expect(wrapper.vm.isVisible).toBe(true)
    expect(wrapper.emitted('close')).toBeFalsy()
  })

})
