import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MessBuilder from '../src/components/MessBuilder.vue'

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

describe('MessBuilder.vue', () => {
  beforeEach(() => {
    menuEventBus.reset()
    document.body.innerHTML = '<div id="app"></div>'
  })

  function makeWrapper (name = null) {
    return mount(MessBuilder, {
      global: {
        mocks: {
          $store: {
            state: { name },
            dispatch: vi.fn(),
            commit: vi.fn()
          }
        },
        stubs: {
          MainMenu: true,
          MessMaker: true
        }
      }
    })
  }

  it('registers init-app listener on created hook', () => {
    makeWrapper()

    expect(menuEventBus.$on).toHaveBeenCalled()
    expect(Object.keys(menuEventBus.handlers)).toContain('init-app')
  })

  it('initMess sets clean status when project name is empty', () => {
    const wrapper = makeWrapper(null)

    wrapper.vm.initMess()

    expect(wrapper.vm.status).toBe('clean')
    expect(wrapper.vm.dbLoaded).toBe(false)
    expect(menuEventBus.$emit).toHaveBeenCalledWith('init-menu', 'clean')
  })

  it('initMess sets dirty status when project name exists', () => {
    const wrapper = makeWrapper('Demo')

    wrapper.vm.initMess()

    expect(wrapper.vm.status).toBe('dirty')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('init-menu', 'dirty')
  })
})
