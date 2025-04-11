import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckBoxGroup from '@/components/CheckboxGroup.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key 
  })
}))

describe('CheckBoxGroup.vue', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' }
  ]

  it('renders all options and the select-all checkbox', () => {
    const wrapper = mount(CheckBoxGroup, {
      props: {
        options,
        modelValue: []
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(4)
    expect(wrapper.text()).toContain('FilterPanel.Select-all')
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')
    expect(wrapper.text()).toContain('Option C')
  })

  it('emits updated modelValue when a checkbox is checked', async () => {
    const wrapper = mount(CheckBoxGroup, {
      props: {
        options,
        modelValue: []
      }
    })

    const optionCheckboxes = wrapper.findAll('input[type="checkbox"]').slice(1)
    await optionCheckboxes[0].setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['a'])
  })

  it('toggles all checkboxes when "Select all" is clicked', async () => {
    const wrapper = mount(CheckBoxGroup, {
      props: {
        options,
        modelValue: []
      }
    })

    const selectAllCheckbox = wrapper.find('input[type="checkbox"]')
    await selectAllCheckbox.setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['a', 'b', 'c'])

    await selectAllCheckbox.setValue(false)
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual([])
  })

  it('handles plain string options (non-object)', async () => {
    const wrapper = mount(CheckBoxGroup, {
      props: {
        options: ['x', 'y'],
        modelValue: ['x']
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(3) 
    expect(wrapper.text()).toContain('x')
    expect(wrapper.text()).toContain('y')
  })
})
