import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CompactItemCard from '@/components/CompactItemCard.vue'
import StatusBanner from '@/components/StatusBanner.vue'

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    getUserById: vi.fn(() => Promise.resolve({ profilePicture: '/seller-pic.jpg' }))
  })
}))

describe('CompactItemCard.vue', () => {
  const item = {
    id: 1,
    title: 'Test Item',
    price: 500,
    status: 'available',
    sellerId: 123,
    imageUrls: ['/item-pic.jpg']
  }

  it('renders item title and price', async () => {
    const wrapper = mount(CompactItemCard, {
      props: { item }
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Test Item')
    expect(wrapper.text()).toContain('500 kr')
  })

  it('renders item image and profile image', async () => {
    const wrapper = mount(CompactItemCard, {
      props: { item }
    })

    await flushPromises()
    const images = wrapper.findAll('img')
    expect(images[0].attributes('src')).toBe('/item-pic.jpg')
    expect(images[1].attributes('src')).toBe('/seller-pic.jpg')
  })

  it('renders StatusBanner with correct status', async () => {
    const wrapper = mount(CompactItemCard, {
      props: { item }
    })

    await flushPromises()
    const banner = wrapper.findComponent(StatusBanner)
    expect(banner.exists()).toBe(true)
    expect(banner.props('status')).toBe('available')
  })

  it('uses fallback images on error', async () => {
    const wrapper = mount(CompactItemCard, {
      props: { item }
    })

    await flushPromises()
    const itemImg = wrapper.findAll('img')[0]
    const profileImg = wrapper.findAll('img')[1]

    await itemImg.trigger('error')
    await profileImg.trigger('error')

    expect(itemImg.element.src).toContain('/no-image.png')
    expect(profileImg.element.src).toContain('/default-picture.jpg')
  })

  it('uses pre-provided seller prop if available', async () => {
    const wrapper = mount(CompactItemCard, {
      props: {
        item,
        seller: { profilePicture: '/preset.jpg' }
      }
    })

    await flushPromises()
    const profileImg = wrapper.findAll('img')[1]
    expect(profileImg.attributes('src')).toBe('/preset.jpg')
  })
})
