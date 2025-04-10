import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '@/components/ErrorMessage.vue'

describe('ErrorMessage.vue', () => {
  it('does not render anything when there is no message provided', () => {
    const wrapper = mount(ErrorMessage)
    expect(wrapper.find('.user-warning').exists()).toBe(false)
  })

  it('renders message provided', () => {
    const message = 'Something went wrong'
    const wrapper = mount(ErrorMessage, {
      props: { message }
    })
    expect(wrapper.text()).toContain(message)
    expect(wrapper.find('.user-warning').exists()).toBe(true)
  })

  it('render slot content instead of default message', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Default error message' },
      slots: {
        default: '<span class="custom-error">Custom Error Content</span>'
      }
    })
    expect(wrapper.find('.custom-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Error Content')
  })
})
