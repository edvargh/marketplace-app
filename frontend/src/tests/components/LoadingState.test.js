import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoadingState from '@/components/LoadingState.vue'

describe('LoadingState.vue', () => {
  it('renders loading state when loading is true', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: true,
        loadingMessage: 'Please wait...'
      }
    })
    expect(wrapper.find('.state.loading').exists()).toBe(true)
    expect(wrapper.find('.state.loading').text()).toContain('Please wait...')
    expect(wrapper.find('.state.error').exists()).toBe(false)
  })

  it('renders error state when error is provided and loading is false', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: false,
        error: 'Test error message'
      }
    })
    expect(wrapper.find('.state.error').exists()).toBe(true)
    expect(wrapper.find('.state.error').text()).toContain('Test error message')
    expect(wrapper.find('.state.loading').exists()).toBe(false)
  })

  it('renders default error message when error prop is not provided and loading is false', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: false
      }
    })
    expect(wrapper.find('.state.error').exists()).toBe(true)
    expect(wrapper.find('.state.error').text()).toContain("Something went wrong. Please try again.")
  })

  it('renders default loading message when loadingMessage prop is not provided and loading is true', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: true
      }
    })
    expect(wrapper.find('.state.loading').exists()).toBe(true)
    expect(wrapper.find('.state.loading').text()).toContain("Loading...")
  })

  it('prioritizes loading state over error state when both props are true', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: true,
        error: 'This error should not be shown'
      }
    })
    expect(wrapper.find('.state.loading').exists()).toBe(true)
    expect(wrapper.find('.state.error').exists()).toBe(false)
  })

  it('renders nothing when both loading is false and error is empty string', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: false,
        error: ''
      }
    })
    expect(wrapper.find('.state.loading').exists()).toBe(false)
    expect(wrapper.find('.state.error').exists()).toBe(false)
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders with an undefined loading prop (treated as false)', () => {
    const wrapper = mount(LoadingState, {
      props: {
        error: 'Error message'
      }
    })
    expect(wrapper.find('.state.loading').exists()).toBe(false)
    expect(wrapper.find('.state.error').exists()).toBe(true)
  })

  it('contains error icon in error state', () => {
    const wrapper = mount(LoadingState, {
      props: {
        loading: false,
        error: 'Test error'
      }
    })
    expect(wrapper.find('.error-icon').exists()).toBe(true)
    expect(wrapper.find('.error-icon').text()).toBe('⚠️')
  })

  it('renders correctly when no props are provided (should show default error)', () => {
    const wrapper = mount(LoadingState)
    expect(wrapper.find('.state.error').exists()).toBe(true)
    expect(wrapper.find('.state.error').text()).toContain("Something went wrong. Please try again.")
  })
})
