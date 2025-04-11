import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import FavoriteBtn from '@/components/FavoriteBtn.vue'
import { useItemStore } from '@/stores/itemStore'

vi.mock('@/stores/itemStore', () => ({
  useItemStore: vi.fn(() => ({
    toggleFavorite: vi.fn()
  }))
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/items/:id',
      name: 'item',
      component: {}
    }
  ]
})

router.currentRoute.value = {
  params: { id: '1' }
}

describe('FavoriteBtn', () => {
  it('render with default props', () => {
    const wrapper = mount(FavoriteBtn, {
      props: {
        isFavorite: false
      },
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.find('.favorite-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Favorite')
  })

  it('show correct state when favorited', () => {
    const wrapper = mount(FavoriteBtn, {
      props: {
        isFavorite: true
      },
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.text()).toContain('Unfavorite')
    expect(wrapper.find('.favorite').exists()).toBe(true)
  })

  it('call toggleFavorite when clicked', async () => {
    const mockToggleFavorite = vi.fn().mockResolvedValue(true)
    useItemStore.mockImplementation(() => ({
      toggleFavorite: mockToggleFavorite
    }))

    const wrapper = mount(FavoriteBtn, {
      props: {
        isFavorite: false
      },
      global: {
        plugins: [router]
      }
    })
    await wrapper.find('.favorite-btn').trigger('click')
    expect(mockToggleFavorite).toHaveBeenCalled()
  })

  it('emit update:isFavorite when toggle is successful', async () => {
    const mockToggleFavorite = vi.fn().mockResolvedValue(true)
    useItemStore.mockImplementation(() => ({
      toggleFavorite: mockToggleFavorite
    }))

    const wrapper = mount(FavoriteBtn, {
      props: {
        isFavorite: false
      },
      global: {
        plugins: [router]
      }
    })
    await wrapper.find('.favorite-btn').trigger('click')
    expect(wrapper.emitted('update:isFavorite')[0]).toEqual([true])
  })

  it('does not emit update:isFavorite when toggle fails', async () => {
    const mockToggleFavorite = vi.fn().mockResolvedValue(false)
    useItemStore.mockImplementation(() => ({
      toggleFavorite: mockToggleFavorite
    }))

    const wrapper = mount(FavoriteBtn, {
      props: {
        isFavorite: false
      },
      global: {
        plugins: [router]
      }
    })
    await wrapper.find('.favorite-btn').trigger('click')
    expect(wrapper.emitted('update:isFavorite')).toBeFalsy()
  })
})