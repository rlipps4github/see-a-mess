import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EditNavigation from '../src/components/EditNavigation.vue'

describe('EditNavigation.vue', () => {
  it('shows On labels and hints by default', () => {
    const wrapper = mount(EditNavigation)

    expect(wrapper.text()).toContain('Auto Navigation On')
    expect(wrapper.text()).toContain('Single Page Scrolling On')
  })

  it('emits update:autoNavigation with inverse value on toggle click', async () => {
    const wrapper = mount(EditNavigation, {
      props: {
        autoNavigation: true,
        spsEnabled: true
      }
    })

    await wrapper.findAll('.edit-navigation__toggle')[0].trigger('click')

    expect(wrapper.emitted('update:autoNavigation')).toBeTruthy()
    expect(wrapper.emitted('update:autoNavigation')[0]).toStrictEqual([false])
  })

  it('emits update:spsEnabled with inverse value on toggle click', async () => {
    const wrapper = mount(EditNavigation, {
      props: {
        autoNavigation: true,
        spsEnabled: true
      }
    })

    await wrapper.findAll('.edit-navigation__toggle')[1].trigger('click')

    expect(wrapper.emitted('update:spsEnabled')).toBeTruthy()
    expect(wrapper.emitted('update:spsEnabled')[0]).toStrictEqual([false])
  })
})
