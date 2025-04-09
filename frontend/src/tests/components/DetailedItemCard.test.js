import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import DetailedItemCard from '@/components/DetailedItemCard.vue'

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    getUserById: vi.fn(() => Promise.resolve({ profilePicture: 'fetched-pic.png' }))
  })
}))

describe('DetailedItemCard.vue', () => {
  const defaultItem = {
    id: '123',
    title: 'Test Item',
    price: 100,
    imageUrls: ['item-image.png'],
    status: 'Reserved',
    sellerId: 'user123'
  }

  const mountComponent = (props = {}) => {
    return mount(DetailedItemCard, {
      props: { item: defaultItem, ...props },
      global: {
        stubs: {
          RouterLink: {
            name: 'RouterLink',
            template: '<div><slot /></div>',
            props: ['to']
          },
          StatusBanner: true
        }
      }
    })
  }

  it('render link (card) with correct item details', () => {
    const seller = { profilePicture: 'seller-pic.png' }
    const wrapper = mountComponent({ seller })
    expect(wrapper.text()).toContain('Test Item')
    expect(wrapper.text()).toContain('Price')
    expect(wrapper.text()).toContain('100 kr')
    expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBe(true)
  })

  it('display first image', () => {
    const wrapper = mountComponent()
    const imgMain = wrapper.find('img.card-image')
    expect(imgMain.attributes('src')).toBe('item-image.png')
  })

  it('display /no-image.png when images is empty or on error', async () => {
    const itemWithoutImage = { ...defaultItem, imageUrls: [] }
    const wrapper = mount(DetailedItemCard, {
      props: { item: itemWithoutImage },
      global: {
        stubs: {
          RouterLink: {
            template: '<div><slot /></div>',
            props: ['to']
          },
          StatusBanner: true
        }
      }
    })
    const imgMain = wrapper.find('img.card-image')
    expect(imgMain.attributes('src')).toBe('/no-image.png')
  })

  it('use seller profile picture when provided (not /no-image.png)', async () => {
    const seller = { profilePicture: 'seller-prop-pic.png' }
    const wrapper = mountComponent({ seller })
    const profileImg = wrapper.find('img.profile-image')
    expect(profileImg.attributes('src')).toBe('seller-prop-pic.png')
  })

  it('fetch seller data if not provided', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    const profileImg = wrapper.find('img.profile-image')
    expect(profileImg.attributes('src')).toBe('fetched-pic.png')
  })

  it('handle profile image error by setting default picture', async () => {
    const seller = { profilePicture: 'broken-url.png' }
    const wrapper = mountComponent({ seller })
    const profileImg = wrapper.find('img.profile-image')
    await profileImg.trigger('error')
    expect(profileImg.attributes('src')).toBe('/default-picture.jpg')
  })

  it('update sellerProfilePicture when seller prop changes', async () => {
    const wrapper = mountComponent({ seller: { profilePicture: 'initial-pic.png' } })
    const profileImg = wrapper.find('img.profile-image')
    expect(profileImg.attributes('src')).toBe('initial-pic.png')

    await wrapper.setProps({ seller: { profilePicture: 'updated-pic.png' } })
    expect(wrapper.find('img.profile-image').attributes('src')).toBe('updated-pic.png')
  })
})
