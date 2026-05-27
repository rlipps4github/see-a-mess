import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImportFile from '../src/components/Import.vue'

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

describe('Import.vue', () => {
  beforeEach(() => {
    menuEventBus.reset()
  })

  function makeWrapper () {
    return mount(ImportFile, {
      global: {
        mocks: {
          $store: {
            commit: vi.fn()
          }
        }
      }
    })
  }

  it('sets messFileList when file input changes', () => {
    const wrapper = makeWrapper()
    const fakeFiles = [{ name: 'demo.mess' }]

    wrapper.vm.onFileChange({ target: { files: fakeFiles } })

    expect(wrapper.vm.messFileList).toStrictEqual(fakeFiles)
  })

  it('dehashMess reverses hashMess output', () => {
    const wrapper = makeWrapper()
    const original = JSON.stringify({ name: 'Demo', main: '<section></section>' })

    const hashed = wrapper.vm.hashMess(original)
    const decoded = wrapper.vm.dehashMess(hashed)

    expect(decoded).toBe(original)
  })
})
