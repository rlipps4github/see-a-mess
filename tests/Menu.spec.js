import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Menu from '../src/components/Menu.vue'

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

describe('Menu.vue', () => {
  beforeEach(() => {
    menuEventBus.reset()
  })

  function makeWrapper (storeState = { name: null, html_location: {} }) {
    return mount(Menu, {
      global: {
        mocks: {
          $store: {
            state: storeState
          }
        },
        stubs: {
          ImportFile: true,
          ImportImage: true,
          Edit: true
        }
      }
    })
  }

  it('shows Add Navigation Menu option in add menu list', async () => {
    const wrapper = makeWrapper()
    await wrapper.setData({ currentMenu: 'add' })

    const menuText = wrapper.text()
    expect(menuText).toContain('Add Page')
    expect(menuText).toContain('Add Navigation Menu')
  })

  it('shows Add Page as the first item in add menu list', async () => {
    const wrapper = makeWrapper()
    await wrapper.setData({ currentMenu: 'add' })

    const addItems = wrapper.findAll('#menu li').map((item) => item.text())
    expect(addItems[0]).toBe('Add Page')
  })

  it('emits add-div and close-menu when Add Row is clicked', () => {
    const wrapper = makeWrapper()

    wrapper.vm.menuClick('Add Row')

    expect(menuEventBus.$emit).toHaveBeenCalledWith('add-div', 'row')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('close-menu')
  })

  it('emits new-mess when creating a new project with empty store name', () => {
    const wrapper = makeWrapper({ name: null, html_location: {} })

    wrapper.vm.createData()

    expect(menuEventBus.$emit).toHaveBeenCalledWith('new-mess')
  })

  it('emits add-navigation-menu and close-menu when Add Navigation Menu is clicked', () => {
    const wrapper = makeWrapper()

    wrapper.vm.menuClick('Add Navigation Menu')

    expect(menuEventBus.$emit).toHaveBeenCalledWith('add-navigation-menu')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('close-menu')
  })

  it('emits add-page and close-menu when Add Page is clicked', () => {
    const wrapper = makeWrapper()

    wrapper.vm.menuClick('Add Page')

    expect(menuEventBus.$emit).toHaveBeenCalledWith('add-page')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('close-menu')
  })
})
