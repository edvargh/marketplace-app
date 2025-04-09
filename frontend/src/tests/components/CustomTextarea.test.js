import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomTextarea from '@/components/CustomTextarea.vue'

describe('CustomTextarea', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(CustomTextarea)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('receives and displays modelValue prop', () => {
    const testValue = 'Test content'
    const wrapper = mount(CustomTextarea, {
      props: { modelValue: testValue }
    })
    expect(wrapper.find('textarea').element.value).toBe(testValue)
  })

  it('shows the correct placeholder', () => {
    const placeholderText = 'Enter your text here'
    const wrapper = mount(CustomTextarea, {
      props: { placeholder: placeholderText }
    })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe(placeholderText)
  })

  it('applies disabled attribute when disabled prop is true', () => {
    const wrapper = mount(CustomTextarea, {
      props: { disabled: true }
    })
    expect(wrapper.find('textarea').attributes('disabled')).toBe('')
  })

  it('applies required attribute when required prop is true', () => {
    const wrapper = mount(CustomTextarea, {
      props: { required: true }
    })
    expect(wrapper.find('textarea').attributes('required')).toBe('')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(CustomTextarea)
    const textarea = wrapper.find('textarea')
    const testValue = 'New value'

    await textarea.setValue(testValue)
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([testValue])
  })

  it('adjusts height based on content', async () => {
    const wrapper = mount(CustomTextarea)
    const textarea = wrapper.find('textarea').element
    
    Object.defineProperty(textarea, 'scrollHeight', {
      get: vi.fn().mockReturnValue(100),
      configurable: true
    })
    
    await wrapper.setProps({ modelValue: 'Line 1' })
    await wrapper.vm.$nextTick()
    const initialHeight = textarea.style.height
    
    Object.defineProperty(textarea, 'scrollHeight', {
      get: vi.fn().mockReturnValue(200),
      configurable: true
    })
    
    await wrapper.setProps({ modelValue: 'Line 1\nLine 2\nLine 3' })
    await wrapper.vm.$nextTick()
    
    expect(textarea.style.height).not.toBe(initialHeight)
    expect(textarea.style.height).toBe('200px')
  })

  it('handles empty value correctly', () => {
    const wrapper = mount(CustomTextarea, {
      props: { modelValue: '' }
    })
    expect(wrapper.find('textarea').element.value).toBe('')
  })

  it('maintains functionality when disabled', async () => {
    const wrapper = mount(CustomTextarea, {
      props: { disabled: true, modelValue: 'Initial' }
    })
    
    await wrapper.find('textarea').setValue('New value')
    
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.props('modelValue')).toBe('Initial')
  })
})
