import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImportImg from '../src/components/ImportImg.vue'

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

describe('ImportImg.vue', () => {
  beforeEach(() => {
    menuEventBus.reset()
  })

  function makeWrapper (images = []) {
    return mount(ImportImg, {
      global: {
        mocks: {
          $store: {
            state: {
              css: {
                images
              }
            },
            dispatch: vi.fn()
          }
        }
      }
    })
  }

  it('emits add-image event with payload when addImage is called', () => {
    const wrapper = makeWrapper()

    wrapper.vm.addImage('logo', 'abc123')

    expect(menuEventBus.$emit).toHaveBeenCalledWith('add-image', {
      name: 'logo',
      file: 'abc123'
    })
  })

  it('loads initial image list from store on created', () => {
    const initialImages = [{ name: 'hero', file: 'base64data' }]
    const wrapper = makeWrapper(initialImages)

    expect(wrapper.vm.imageList).toEqual(initialImages)
  })
})
