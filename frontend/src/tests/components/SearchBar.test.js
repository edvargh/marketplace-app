import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SearchBar from '@/components/SearchBar.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'root',
    component: { template: '<div>Root Page</div>' }
  },
  {
    path: '/items',
    name: 'Items',
    component: { template: '<div>Items Page</div>' }
  }
]

function setupTestWithRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  const wrapper = mount(SearchBar, {
    global: {
      plugins: [router]
    }
  })

  return { wrapper, router }
}

describe('SearchBar.vue', () => {
  it('renders input and button', () => {
    const { wrapper } = setupTestWithRouter()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('updates input value with v-model', async () => {
    const { wrapper } = setupTestWithRouter()
    const input = wrapper.find('input')
    await input.setValue('Vue Test')
    expect(input.element.value).toBe('Vue Test')
  })

  it('does not navigate if query is empty', async () => {
    const { wrapper, router } = setupTestWithRouter()
    await router.isReady()

    const input = wrapper.find('input')
    await input.setValue('   ')
    await wrapper.find('button').trigger('click')

    expect(router.currentRoute.value.fullPath).not.toContain('searchQuery')
  })
})
