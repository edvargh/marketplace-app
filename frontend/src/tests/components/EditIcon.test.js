import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EditIcon from '@/components/EditIcon.vue'

describe('EditIcon.vue', () => {
  it('renders the edit icon image', () => {
    const wrapper = mount(EditIcon)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/edit-icon.png')
    expect(img.attributes('alt')).toBe('Edit')
  })

  it('emits click event on image click', async () => {
    const wrapper = mount(EditIcon)
    await wrapper.find('img').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
