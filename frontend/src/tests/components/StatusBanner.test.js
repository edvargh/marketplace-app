import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusBanner from '@/components/StatusBanner.vue';

describe('StatusBanner.vue', () => {
  it('has the status-banner class', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: 'for_sale' }
    });
    expect(wrapper.classes()).toContain('status-banner');
  });

  it('renders status with underscores replaced by spaces', () => {
    const wrapper = mount(StatusBanner, {
      props: {
        status: 'for_sale'
      }
    });
    expect(wrapper.text()).toBe('for sale');
  });

  it('renders status as it is if no underscores are present', () => {
    const wrapper = mount(StatusBanner, {
      props: {
        status: 'sold'
      }
    });
    expect(wrapper.text()).toBe('sold');
  });

  it('handles multiple underscores properly', () => {
    const wrapper = mount(StatusBanner, {
      props: {
        status: 'waiting_for_payment'
      }
    });
    expect(wrapper.text()).toBe('waiting for payment');
  });

  it('renders empty string properly', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: '' }
    });
    expect(wrapper.text()).toBe('');
  });

  it('trims whitespace from status', () => {
    const wrapper = mount(StatusBanner, {
      props: { status: '  for_sale  ' }
    });
    expect(wrapper.text()).toBe('for sale');
  });


});
