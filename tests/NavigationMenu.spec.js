import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NavigationMenu from '../src/components/NavigationMenu.vue'

describe('NavigationMenu.vue', () => {
  it('renders page labels from props', () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        pages: [
          { id: 'home', label: 'Home' },
          { id: 'about', label: 'About' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('About')
  })

  it('emits navigate payload when a page is selected', async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        pages: [{ id: 'home', label: 'Home' }]
      }
    })

    expect(wrapper.find('.navigation-menu__link').attributes('href')).toBe('#home')
    await wrapper.find('.navigation-menu__link').trigger('click')

    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0][0]).toStrictEqual({ id: 'home', label: 'Home' })
  })

  it('shows MENU trigger and toggles mobile open/close events when on mobile width', async () => {
    const originalInnerWidth = window.innerWidth
    window.innerWidth = 800

    const wrapper = mount(NavigationMenu, {
      props: {
        pages: [{ id: 'home', label: 'Home' }]
      }
    })

    const trigger = wrapper.find('.navigation-menu__trigger')
    expect(trigger.exists()).toBe(true)

    await trigger.trigger('click')
    await trigger.trigger('click')

    expect(wrapper.emitted('open-mobile')).toBeTruthy()
    expect(wrapper.emitted('close-mobile')).toBeTruthy()

    window.innerWidth = originalInnerWidth
  })
})
