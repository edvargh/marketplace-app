import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusBanner from '@/components/StatusBanner.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => {
      const translations = {
        'status.sold': 'Sold',
        'status.reserved': 'Reserved',
        'status.forSale': 'For Sale',
      };
      return translations[key] || key;
    }
  })
}));

describe('StatusBanner.vue', () => {
  it('has the status-banner class', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: 'FOR_SALE' }
    });
    expect(wrapper.classes()).toContain('status-banner');
  });

  it('render translated status for FOR_SALE', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: 'FOR_SALE' }
    });
    expect(wrapper.text()).toBe('For Sale');
  });

  it('render translated status for SOLD', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: 'SOLD' }
    });
    expect(wrapper.text()).toBe('Sold');
  });

  it('render status with underscores replaced by spaces for unknown status', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: 'waiting_for_payment' }
    });
    expect(wrapper.text()).toBe('waiting for payment');
  });

  it('render empty string properly', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: '' }
    });
    expect(wrapper.text()).toBe('');
  });
});
