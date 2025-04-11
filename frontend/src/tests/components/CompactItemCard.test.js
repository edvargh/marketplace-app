import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CompactItemCard from '@/components/CompactItemCard.vue'
import StatusBanner from '@/components/StatusBanner.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    getUserById: vi.fn(() => Promise.resolve({ profilePicture: '/seller-pic.jpg' }))
  })
}))

describe('CompactItemCard.vue', () => {
  const defaultItem = {
    id: 1,
    title: 'Test Item',
    price: 500,
    status: 'FOR_SALE',
    sellerId: 123,
    imageUrls: ['/item-pic.jpg']
  }

  const routerLinkStub = {
    template: '<a><slot></slot></a>',
    props: ['to']
  }

  const createWrapper = async (props = {}) => {
    const wrapper = mount(CompactItemCard, {
      props: {
        item: defaultItem,
        ...props
      },
      global: {
        stubs: {
          'router-link': routerLinkStub
        }
      }
    })
    await flushPromises()
    return wrapper
  }

  it('render item title and price', async () => {
    const wrapper = await createWrapper()
    expect(wrapper.text()).toContain('Test Item')
    expect(wrapper.text()).toContain('500 kr')
  })

  it('render item image and profile image', async () => {
    const wrapper = await createWrapper()
    const images = wrapper.findAll('img')
    expect(images[0].attributes('src')).toBe('/item-pic.jpg')
    expect(images[1].attributes('src')).toBe('/seller-pic.jpg')
  })

  it('render StatusBanner with correct status', async () => {
    const wrapper = await createWrapper()
    const banner = wrapper.findComponent(StatusBanner)
    expect(banner.exists()).toBe(true)
    expect(banner.props('status')).toBe('FOR_SALE')
  })

  it('card use fallback images on error', async () => {
    const wrapper = await createWrapper()
    const itemImg = wrapper.findAll('img')[0]
    const profileImg = wrapper.findAll('img')[1]
    await itemImg.trigger('error')
    await profileImg.trigger('error')
    expect(itemImg.element.src).toContain('/no-image.png')
    expect(profileImg.element.src).toContain('/default-picture.jpg')
  })

  it('uses pre-provided seller prop if available', async () => {
    const wrapper = await createWrapper({
      seller: { profilePicture: '/profile.jpg' }
    })
    const profileImg = wrapper.findAll('img')[1]
    expect(profileImg.attributes('src')).toBe('/profile.jpg')
  })
})