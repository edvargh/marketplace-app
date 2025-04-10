import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import ReserveBox from '@/components/ReserveBox.vue' 

describe('ReserveBox.vue', () => {
  const createWrapper = (props = {}) => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          'ReserveBox.reservation-request': 'Reservation Request',
          'ReserveBox.wants-to-reserve': 'wants to reserve this item',
          'ReserveBox.accept': 'Accept',
          'ReserveBox.decline': 'Decline',
          'ReserveBox.cancel': 'Cancel',
          'ReserveBox.waiting': 'Waiting for seller to respond...',
          'ReserveBox.reservation-accepted': '✓ Reservation accepted',
          'ReserveBox.reservation-declined': '✗ Reservation declined',
          'ReserveBox.seller-accepted': 'The seller has accepted your reservation request!',
          'ReserveBox.seller-declined': 'Seller declined your reservation request'
        }
      }
    })

    return mount(ReserveBox, {
      global: {
        plugins: [i18n]
      },
      props
    })
  }

  it('renders seller view with buttons and emits accept/decline', async () => {
    const wrapper = createWrapper({
      isSellerView: true,
      buyerName: 'Tam',
      initialStatus: 'PENDING',
      hideButtons: false,
      disabled: false
    })
    
    expect(wrapper.text()).toContain('Reservation Request')
    expect(wrapper.text()).toContain('Tam wants to reserve this item')

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Accept')
    expect(buttons[1].text()).toBe('Decline')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted().accept).toBeTruthy()
    expect(wrapper.emitted().decline).toBeTruthy()
  })

  it('disables buttons when disabled prop is true', () => {
    const wrapper = createWrapper({
      isSellerView: true,
      disabled: true
    })
    
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('shows accepted status in sellers view', () => {
    const wrapper = createWrapper({
      isSellerView: true,
      initialStatus: 'ACCEPTED'
    })
    
    expect(wrapper.text()).toContain('✓ Reservation accepted')
  })

  it('shows declined status in sellers view', () => {
    const wrapper = createWrapper({
      isSellerView: true,
      initialStatus: 'DECLINED'
    })
    
    expect(wrapper.text()).toContain('✗ Reservation declined')
  })

  it('renders buyer view with pending message', () => {
    const wrapper = createWrapper({
      isSellerView: false,
      initialStatus: 'PENDING'
    })
    
    expect(wrapper.text()).toContain('Waiting for seller to respond...')
  })

  it('renders buyer view with accepted message', () => {
    const wrapper = createWrapper({
      isSellerView: false,
      initialStatus: 'ACCEPTED'
    })
    
    expect(wrapper.text()).toContain('The seller has accepted your reservation request!')
  })

  it('renders buyer view with declined message', () => {
    const wrapper = createWrapper({
      isSellerView: false,
      initialStatus: 'DECLINED'
    })
    
    expect(wrapper.text()).toContain('Seller declined your reservation request')
  })

  it('shows cancel button and emits cancel when clicked in buyer view', async () => {
    const wrapper = createWrapper({
      isSellerView: false,
      showCancel: true
    })
    
    const cancelButton = wrapper.find('button.this-cancel')
    expect(cancelButton.exists()).toBe(true)
    expect(cancelButton.text()).toBe('Cancel')

    await cancelButton.trigger('click')
    expect(wrapper.emitted().cancel).toBeTruthy()
  })
})