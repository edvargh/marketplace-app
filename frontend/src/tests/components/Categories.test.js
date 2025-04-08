import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Categories from '@/components/Categories.vue'
import CustomButton from '@/components/CustomButton.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key 
  })
}))

describe('Categories.vue', () => {
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' }
  ]

  it('renders all categories', () => {
    const wrapper = mount(Categories, {
      props: { categories }
    })

    const buttons = wrapper.findAllComponents(CustomButton)
    expect(buttons.length).toBe(2)
    expect(wrapper.text()).toContain('Electronics')
    expect(wrapper.text()).toContain('Clothing')
  })

  it('emits "category-click" event when a category is clicked', async () => {
    const wrapper = mount(Categories, {
      props: { categories }
    })

    const firstButton = wrapper.findComponent(CustomButton)
    await firstButton.trigger('click')

    expect(wrapper.emitted('category-click')).toBeTruthy()
    expect(wrapper.emitted('category-click')[0][0]).toEqual(categories[0])
  })

  it('displays the translated title', () => {
    const wrapper = mount(Categories, {
      props: { categories }
    })

    expect(wrapper.find('h3').text()).toBe('categories.Most-popular-categories')
  })
})
