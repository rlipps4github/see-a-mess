import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EditElement from '../src/components/EditElement.vue'

const menuEventBus = vi.hoisted(() => {
  const handlers = {}
  const api = {
    handlers,
    reset () {
      Object.keys(handlers).forEach((k) => { delete handlers[k] })
      api.$on.mockClear()
      api.$emit.mockClear()
    },
    $on: vi.fn((eventName, handler) => {
      if (!handlers[eventName]) handlers[eventName] = []
      handlers[eventName].push(handler)
      return api
    }),
    $emit: vi.fn((eventName, payload) => {
      const list = handlers[eventName] || []
      list.forEach((handler) => handler(payload))
      return api
    })
  }
  return api
})

vi.mock('/src/main.js', () => ({
  menuEventBus
}))

describe('EditElement.vue', () => {
  beforeEach(() => {
    menuEventBus.reset()
  })

  function makeWrapper () {
    const el = document.createElement('div')
    el.id = 'demo'
    el.scrollIntoView = vi.fn()
    return mount(EditElement, {
      global: {
        mocks: {
          $store: {
            state: {
              html_location: el
            }
          }
        }
      }
    })
  }

  function makeNavWrapper () {
    const nav = document.createElement('nav')
    nav.setAttribute('data-navigation-menu', 'true')
    nav.setAttribute('data-auto-navigation', 'on')
    nav.setAttribute('data-sps-enabled', 'on')
    const anchor = document.createElement('a')
    anchor.id = 'link'
    anchor.scrollIntoView = vi.fn()
    nav.appendChild(anchor)

    return mount(EditElement, {
      global: {
        mocks: {
          $store: {
            state: {
              html_location: anchor
            }
          }
        }
      }
    })
  }

  it('converts rgb values to hex', () => {
    const wrapper = makeWrapper()

    expect(wrapper.vm.rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000')
  })

  it('saveSelection emits update-mess and close-menu', () => {
    const wrapper = makeWrapper()
    wrapper.vm.currentEl.setAttribute('data-pulse', 'true')

    wrapper.vm.saveSelection()

    expect(menuEventBus.$emit).toHaveBeenCalledWith('update-mess')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('close-menu')
  })

  it('shows EditNavigation controls when current element is inside nav menu', () => {
    const wrapper = makeNavWrapper()

    expect(wrapper.find('[data-role="edit-navigation"]').exists()).toBe(true)
  })

  it('updates nav attributes and emits refresh event for auto-navigation toggle', () => {
    const wrapper = makeNavWrapper()

    wrapper.vm.handleAutoNavigationUpdate(false)

    expect(wrapper.vm.navigationTargetEl.getAttribute('data-auto-navigation')).toBe('off')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('refresh-navigation-menus')
  })

  it('updates nav attribute for SPS toggle', () => {
    const wrapper = makeNavWrapper()

    wrapper.vm.handleSpsUpdate(false)

    expect(wrapper.vm.navigationTargetEl.getAttribute('data-sps-enabled')).toBe('off')
  })
})
