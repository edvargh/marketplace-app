import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import InputBox from '@/components/InputBox.vue'

describe('InputBox.vue', () => {
  it('renders with default props', () => {
    const wrapper = mount(InputBox)
    const input = wrapper.find('input')
    expect(input.element.type).toBe('text')
    expect(input.element.value).toBe('')
  })

  it('renders with provided modelValue and placeholder', () => {
    const wrapper = mount(InputBox, {
      props: {
        modelValue: 'Test',
        placeholder: 'Enter text here'
      }
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('Test')
    expect(input.attributes('placeholder')).toBe('Enter text here')
  })

  it('emits update:modelValue when user types', async () => {
    const wrapper = mount(InputBox, {
      props: {
        modelValue: 'initial'
      }
    })
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue'][0][0]).toBe('new value')
  })

  it('applies required and disabled attributes when provided', () => {
    const wrapper = mount(InputBox, {
      props: {
        required: true,
        disabled: true
      }
    })
    const input = wrapper.find('input')
    expect(input.attributes()).toHaveProperty('required')
    expect(input.attributes()).toHaveProperty('disabled')
  })

  it('applies error border class when hasError is true', () => {
    const wrapper = mount(InputBox, {
      props: { hasError: true }
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('input-error-border')
  })

  it('does not apply error border class when hasError is false or not set', () => {
    const wrapper = mount(InputBox, {
      props: { hasError: false }
    })
    const input = wrapper.find('input')
    expect(input.classes()).not.toContain('input-error-border')

    const wrapper2 = mount(InputBox)
    const input2 = wrapper2.find('input')
    expect(input2.classes()).not.toContain('input-error-border')
  })
})
