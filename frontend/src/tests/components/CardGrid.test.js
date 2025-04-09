import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import CardGrid from '@/components/CardGrid.vue'

const MockCard = markRaw({
  template: '<div class="mock-card">{{ item.name }}</div>',
  props: ['item']
})

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

  it('handle items with different key', async () => {
    const mixedItems = [
      { id: 1, name: 'Regular ID' },
      { item: { id: 2 }, name: 'Nested ID' },
      { withUserId: 'user3', name: 'User ID' }
    ]

    const wrapper = mount(CardGrid, {
      props: {
        items: mixedItems,
        cardComponent: markRaw(MockCard),
        propName: 'item'
      }
    })
    const cards = wrapper.findAll('.mock-card')
    expect(cards.length).toBe(3)

    expect(cards[0].text()).toBe('Regular ID')
    expect(cards[1].text()).toBe('Nested ID')
    expect(cards[2].text()).toBe('User ID')
  })
})
