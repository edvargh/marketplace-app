import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import Navbar from '@/components/Navbar.vue'
import CustomButton from '@/components/CustomButton.vue'
import { useUserStore } from '@/stores/userStore'
import { RouterLinkStub } from '@vue/test-utils'

const routes = [
  { path: '/', component: {} },
  { path: '/login', component: {} },
  { path: '/favorites', component: {} },
  { path: '/my-items', component: {} },
  { path: '/create', component: {} },
  { path: '/messages/conversations', component: {} },
  { path: '/categories', component: {} },
  { path: '/profile', component: {} }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      navbar: {
        home: 'Home',
        favorites: 'Favorites',
        'my-items': 'My Items',
        'create-listing': 'Create Listing',
        messages: 'Messages',
        account: 'Account',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login'
      }
    }
  }
})

describe('Navbar.vue', () => {
  let pinia
  let userStore
  let wrapper

  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    userStore = useUserStore()

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200
    })

    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
    vi.restoreAllMocks()
    if (wrapper) wrapper.unmount()
  })


  const mountComponent = (options = {}) => {
    return mount(Navbar, {
      global: {
        plugins: [router, i18n, pinia],
        stubs: {
          Teleport: true,
          CustomButton,
          RouterLink: RouterLinkStub
        },
        ...options
      }
    })
  }

  describe('Desktop view', () => {
    it('renders home link correctly', async () => {
      wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.html()).toContain('Home')
    })

    it('hides Categories link for non-admin users', async () => {
      userStore.$patch({
        isAuthenticated: true,
        role: 'USER',
        logout: vi.fn()
      })
      wrapper = mountComponent();
      await wrapper.vm.$nextTick();

      const categoriesLink = wrapper.find('router-link-stub[to="/categories"]');
      expect(categoriesLink.exists()).toBe(false);
    });

    it('closes dropdown when clicked outside', async () => {
      userStore.isAuthenticated = true

      wrapper = mountComponent()
      wrapper.vm.dropdownOpen = true
      await wrapper.vm.$nextTick()
      wrapper.vm.dropdownRef = { contains: () => false }
      const clickEvent = new Event('click')
      wrapper.vm.handleClickOutside(clickEvent)
      expect(wrapper.vm.dropdownOpen).toBe(false)
    })

    it('toggle dropdownOpen on each call', async () => {
      wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.dropdownOpen).toBe(false)
      wrapper.vm.toggleDropdown()
      expect(wrapper.vm.dropdownOpen).toBe(true)
      wrapper.vm.toggleDropdown()
      expect(wrapper.vm.dropdownOpen).toBe(false)
    })
  })

  describe('Mobile view', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      })
    })

    it('shows hamburger menu on mobile', async () => {
      wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isMobile).toBe(true)
      const hamburgerMenu = wrapper.find('.hamburger-menu')
      expect(hamburgerMenu.exists()).toBe(true)
    })

    it('toggles mobile menu when hamburger button is clicked', async () => {
      wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMobileMenu).toBe(false)
      const hamburgerButton = wrapper.find('.hamburger-menu button')
      expect(hamburgerButton.exists()).toBe(true)
      await hamburgerButton.trigger('click')
      expect(wrapper.vm.showMobileMenu).toBe(true)
    })

    it('closes mobile menu when clicked outside', async () => {
      wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      wrapper.vm.showMobileMenu = true
      await wrapper.vm.$nextTick()
      wrapper.vm.mobileMenuRef = { contains: () => false }
      const clickEvent = new Event('click')

      wrapper.vm.handleClickOutside(clickEvent)
      expect(wrapper.vm.showMobileMenu).toBe(false)
    })
  })

  describe('Authentication functionality', () => {
    it('calls logout method and redirects when logout button is clicked', async () => {
      userStore.isAuthenticated = true
      userStore.logout = vi.fn()
      router.push = vi.fn()

      wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      wrapper.vm.dropdownOpen = true
      await wrapper.vm.$nextTick()

      const logoutButton = wrapper.find('.logout-button')
      expect(logoutButton.exists()).toBe(true)
      await logoutButton.trigger('click')

      expect(userStore.logout).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
    })
  })

  describe('Responsive behavior', () => {
    it('updates isMobile state when window is resized', async () => {
      wrapper = mountComponent()

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      wrapper.vm.checkScreenSize()
      expect(wrapper.vm.isMobile).toBe(false)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      })
      wrapper.vm.checkScreenSize()
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('closes mobile menu when switching to desktop view', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      })
      wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      wrapper.vm.showMobileMenu = true
      await wrapper.vm.$nextTick()

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      wrapper.vm.checkScreenSize()

      expect(wrapper.vm.isMobile).toBe(false)
      expect(wrapper.vm.showMobileMenu).toBe(false)
    })
  })

  describe('Lifecycle hooks', () => {
    it('adds event listeners on mount and removes them on unmount', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mountComponent()
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

      wrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

})