import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConversationPreviewCard from '@/components/ConversationPreviewCard.vue'
import StatusBanner from '@/components/StatusBanner.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}))

describe('ConversationPreviewCard.vue', () => {
  const conversation = {
    item: {
      id: 42,
      title: 'Example Item',
      price: 999,
      status: 'reserved',
      imageUrls: ['/img.png']
    },
    withUserId: 101,
    latestMessage: 'Hey, is this still available?'
  }

  it('renders item title, price, and message', () => {
    const wrapper = mount(ConversationPreviewCard, {
      props: { conversation }
    })

    expect(wrapper.text()).toContain('Example Item')
    expect(wrapper.text()).toContain('999 kr')
    expect(wrapper.text()).toContain('Hey, is this still available?')
  })

  it('renders fallback image if no image is available', () => {
    const wrapper = mount(ConversationPreviewCard, {
      props: {
        conversation: {
          ...conversation,
          item: {
            ...conversation.item,
            imageUrls: []
          }
        }
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/no-image.png')
  })

  it('renders StatusBanner with correct status', () => {
    const wrapper = mount(ConversationPreviewCard, {
      props: { conversation }
    })

    const banner = wrapper.findComponent(StatusBanner)
    expect(banner.exists()).toBe(true)
    expect(banner.props('status')).toBe('reserved')
  })

  it('navigates to the conversation on click', async () => {
    const wrapper = mount(ConversationPreviewCard, {
      props: { conversation }
    })

    await wrapper.trigger('click')

    expect(push).toHaveBeenCalledWith({
      name: 'ConversationView',
      query: {
        itemId: 42,
        withUserId: 101
      }
    })
  })
})
