import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CardGrid from '@/components/CardGrid.vue'

const MockCard = {
  template: '<div class="mock-card">{{ item.name }}</div>',
  props: ['item']
}

describe('CardGrid.vue', () => {
  const items = [
    { id: 1, name: 'Item One' },
    { id: 2, name: 'Item Two' }
  ]

  it('renders the correct number of cards', () => {
    const wrapper = mount(CardGrid, {
      props: {
        items,
        cardComponent: MockCard,
        propName: 'item'
      }
    })

    const cards = wrapper.findAll('.mock-card')
    expect(cards.length).toBe(2)
  })

  it('applies the correct variant class', () => {
    const wrapper = mount(CardGrid, {
      props: {
        items,
        cardComponent: MockCard,
        variant: 'compact',
        propName: 'item'
      }
    })

    expect(wrapper.classes()).toContain('card-grid--compact')
  })
})
