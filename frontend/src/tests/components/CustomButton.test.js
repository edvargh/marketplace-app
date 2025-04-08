import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomButton from '@/components/CustomButton.vue'

describe('CustomButton.vue', () => {
  it('renders default button type', () => {
    const wrapper = mount(CustomButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('renders custom button type', () => {
    const wrapper = mount(CustomButton, {
      props: {
        type: 'submit'
      }
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('emits click event on button click', async () => {
    const wrapper = mount(CustomButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('disables the button when disabled prop is true', async () => {
    const wrapper = mount(CustomButton, {
      props: {
        disabled: true
      }
    })
  
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()  
  })

  it('does not disable the button when disabled prop is false', async () => {
    const wrapper = mount(CustomButton, {
      props: {
        disabled: false
      }
    })
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })
})
