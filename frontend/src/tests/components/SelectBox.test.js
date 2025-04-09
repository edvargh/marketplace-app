import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectBox from '@/components/SelectBox.vue'

describe('SelectBox', () => {
  const mockOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ]

  it('render with default props', () => {
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions
      }
    })
    expect(wrapper.find('.InputBox').exists()).toBe(true)
  })

  it('display placeholder when no value is selected', () => {
    const placeholder = 'Select an option'
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions,
        placeholder
      }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe(placeholder)
  })

  it('display selected option', () => {
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions,
        modelValue: '1'
      }
    })
    expect(wrapper.find('input').element.value).toBe('Option 1')
  })

  it('open dropdown on click', async () => {
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions
      }
    })
    await wrapper.find('.InputBox').trigger('click')
    expect(wrapper.find('.custom-dropdown-menu').exists()).toBe(true)
  })

  it('emit update:modelValue when option is selected', async () => {
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions
      }
    })
    await wrapper.find('.InputBox').trigger('click')
    await wrapper.findAll('li')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2'])
  })

  it('close dropdown when clicking outside of the select box', async () => {
    const wrapper = mount(SelectBox, {
      props: {
        options: mockOptions
      }
    })
    await wrapper.find('.InputBox').trigger('click')
    expect(wrapper.find('.custom-dropdown-menu').exists()).toBe(true)

    document.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.custom-dropdown-menu').exists()).toBe(false)
  })

  it('handle and display option label and keys', () => {
    const customOptions = [
      { name: 'Option 1', id: '1' },
      { name: 'Option 2', id: '2' }
    ]
    const wrapper = mount(SelectBox, {
      props: {
        options: customOptions,
        optionLabel: 'name',
        optionValue: 'id',
        modelValue: '1'
      }
    })
    expect(wrapper.find('input').element.value).toBe('Option 1')
  })
})