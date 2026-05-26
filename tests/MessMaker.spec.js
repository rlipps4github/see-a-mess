import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import MessMaker from '../src/components/MessMaker.vue'

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
  menuEventBus,
  buildPageTemplate: (pageId = 'home') => `
    <section id="${pageId}" class="page unstyled">
      <div class="row unstyled">
        <div class="column unstyled col-2">
          <div class="content unstyled">
            <h2>Remove me and add some content!</h2>
          </div>
        </div>
        <div class="column unstyled col-2">
          <div class="content unstyled"></div>
        </div>
      </div>
    </section>
  `
}))

describe('MessMaker.vue', () => {
  let mountedWrappers = []

  beforeEach(() => {
    menuEventBus.reset()
    window.scrollTo = vi.fn()
    window.prompt = vi.fn()
    window.confirm = vi.fn()
    window.history.replaceState({}, '', '/')
    document.title = 'See a Mess?'
    document.querySelector('meta[name="description"]')?.remove()
    document.querySelector('meta[property="og:title"]')?.remove()
    document.querySelector('meta[name="twitter:title"]')?.remove()
    document.body.innerHTML = `
      <section id="mess-body">
        <div id="mess-header"></div>
        <div id="mess-main"></div>
        <div id="mess-footer"></div>
      </section>
    `
    mountedWrappers = []
  })

  afterEach(() => {
    mountedWrappers.forEach((wrapper) => wrapper.unmount())
    mountedWrappers = []
  })

  function makeStore (name = null, overrides = {}) {
    return {
      state: {
        name,
        header: '<h1>h</h1>',
        main: '<section class="page" id="home"></section>',
        footer: '<h3>f</h3>',
        js: {},
        css: {},
        ...overrides
      },
      commit: vi.fn()
    }
  }

  function makeWrapper (name = null, stateOverrides = {}) {
    const wrapper = mount(MessMaker, {
      attachTo: document.body,
      global: {
        mocks: {
          $store: makeStore(name, stateOverrides)
        }
      }
    })
    mountedWrappers.push(wrapper)
    return wrapper
  }

  it('emits wipe-mess-db during init when store has no project name', () => {
    makeWrapper(null)

    expect(menuEventBus.$emit).toHaveBeenCalledWith('wipe-mess-db')
  })

  it('commits and emits set-mess-db when header changes', () => {
    const wrapper = makeWrapper('Demo')

    wrapper.vm.updateHeader('<h1>updated</h1>')

    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('updateHeader', '<h1>updated</h1>')
    expect(menuEventBus.$emit).toHaveBeenCalledWith('set-mess-db')
  })

  it('adds a navigation menu with links derived from active pages', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    await nextTick()
    await nextTick()

    const nav = document.querySelector('nav[data-navigation-menu="true"]')
    expect(nav).toBeTruthy()

    const labels = Array.from(nav.querySelectorAll('.navigation-menu__link')).map((link) => link.textContent.trim())
    expect(labels).toContain('Home')
  })

  it('keeps navigation component mounted after addNavigationMenu persists html', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    await nextTick()
    await nextTick()

    const nav = document.querySelector('nav[data-navigation-menu="true"]')
    expect(nav.__navigationMenuApp).toBeTruthy()
    expect(nav.querySelector('.navigation-menu__link')).toBeTruthy()
  })

  it('keeps navigation component mounted after refresh-navigation-menus event', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    await nextTick()
    await nextTick()

    menuEventBus.$emit('refresh-navigation-menus')
    await nextTick()
    await nextTick()

    const nav = document.querySelector('nav[data-navigation-menu="true"]')
    expect(nav.__navigationMenuApp).toBeTruthy()
    expect(nav.querySelector('.navigation-menu__link')).toBeTruthy()
  })

  it('detaches mounted nav apps before refresh-navigation-menus persistence rewrite', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    await nextTick()
    await nextTick()

    const unmountSpy = vi.spyOn(wrapper.vm, 'unmountNavigationMenuComponent')
    menuEventBus.$emit('refresh-navigation-menus')
    await nextTick()
    await nextTick()

    expect(unmountSpy).toHaveBeenCalled()
    const nav = document.querySelector('nav[data-navigation-menu="true"]')
    expect(nav.__navigationMenuApp).toBeTruthy()
    unmountSpy.mockRestore()
  })

  it('refreshes auto-navigation menus when pages change', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()

    const main = document.querySelector('#mess-main')
    const newPage = document.createElement('section')
    newPage.className = 'page'
    newPage.id = 'contact'
    main.appendChild(newPage)

    wrapper.vm.refreshNavigationMenus()
    await nextTick()

    const navLabels = Array.from(document.querySelectorAll('nav[data-navigation-menu="true"] .navigation-menu__link'))
      .map((link) => link.textContent.trim())
    expect(navLabels).toContain('Contact')
  })

  it('hides inactive sections when SPS is off', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    main.appendChild(secondPage)

    const nav = document.createElement('nav')
    nav.setAttribute('data-navigation-menu', 'true')
    nav.setAttribute('data-sps-enabled', 'off')
    document.querySelector('#mess-header').appendChild(nav)

    wrapper.vm.navigateToSection('contact', nav)

    expect(document.querySelector('#home').classList.contains('hidden')).toBe(true)
    expect(document.querySelector('#contact').classList.contains('hidden')).toBe(false)
  })

  it('uses hash navigation to switch active section', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    main.appendChild(secondPage)

    const nav = document.createElement('nav')
    nav.setAttribute('data-navigation-menu', 'true')
    nav.setAttribute('data-sps-enabled', 'off')
    document.querySelector('#mess-header').appendChild(nav)

    window.history.replaceState({}, '', '/#contact')
    wrapper.vm.handleNavigationHashChange()

    expect(document.querySelector('#contact').classList.contains('hidden')).toBe(false)
    expect(document.querySelector('#home').classList.contains('hidden')).toBe(true)
  })

  it('uses clicked nav SPS mode during hashchange navigation', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    main.appendChild(secondPage)

    const firstNav = document.createElement('nav')
    firstNav.setAttribute('data-navigation-menu', 'true')
    firstNav.setAttribute('data-sps-enabled', 'on')

    const secondNav = document.createElement('nav')
    secondNav.setAttribute('data-navigation-menu', 'true')
    secondNav.setAttribute('data-sps-enabled', 'off')

    document.querySelector('#mess-header').appendChild(firstNav)
    document.querySelector('#mess-footer').appendChild(secondNav)

    window.history.replaceState({}, '', '/#home')
    wrapper.vm.handleNavigationIntent('contact', secondNav)
    wrapper.vm.handleNavigationHashChange()

    expect(document.querySelector('#contact').classList.contains('hidden')).toBe(false)
    expect(document.querySelector('#home').classList.contains('hidden')).toBe(true)
  })

  it('updates title and meta tags on navigation', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    secondPage.setAttribute('data-page-name', 'Contact Us')
    main.appendChild(secondPage)

    wrapper.vm.navigateToSection('contact')

    expect(document.title).toBe('Contact Us | See a Mess?')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Contact Us page in See a Mess?')
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Contact Us | See a Mess?')
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Contact Us | See a Mess?')
  })

  it('pushes history when navigating to the currently active hash', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const pushSpy = vi.spyOn(window.history, 'pushState')
    window.history.replaceState({}, '', '/#home')

    wrapper.vm.handleNavigationIntent('home')

    expect(pushSpy).toHaveBeenCalled()
    pushSpy.mockRestore()
  })

  it('rehydrates persisted nav markup so desktop does not stay in mobile MENU mode', async () => {
    const wrapper = makeWrapper('Demo', {
      main: '<nav data-navigation-menu="true" data-auto-navigation="on" data-sps-enabled="on"><button class="navigation-menu__trigger">MENU</button></nav><section class="page" id="home"></section>'
    })
    await nextTick()
    await nextTick()

    const nav = wrapper.element.querySelector('nav[data-navigation-menu="true"]')
    expect(nav.querySelector('.navigation-menu__link')?.textContent.trim()).toBe('Home')
    expect(nav.querySelector('.navigation-menu__trigger')).toBeNull()
  })

  it('adds a new page from prompt using the home page skeleton', async () => {
    const wrapper = makeWrapper('Demo')
    window.prompt.mockReturnValue('Contact Page')
    await nextTick()

    wrapper.vm.addPage()

    const newPage = document.querySelector('#mess-main section.page#contact-page')
    expect(newPage).toBeTruthy()
    expect(newPage.getAttribute('data-page-name')).toBe('Contact Page')
    expect(newPage.querySelector('.row.unstyled')).toBeTruthy()
    expect(newPage.querySelectorAll('.column.unstyled').length).toBe(2)
  })

  it('creates a unique page id when the name already exists', async () => {
    const wrapper = makeWrapper('Demo')
    window.prompt.mockReturnValue('Home')
    window.confirm.mockReturnValue(true)
    await nextTick()

    wrapper.vm.addPage()

    expect(document.querySelector('#mess-main section.page#home-2')).toBeTruthy()
  })

  it('does nothing when add page prompt is cancelled', async () => {
    const wrapper = makeWrapper('Demo')
    window.prompt.mockReturnValue(null)
    await nextTick()

    wrapper.vm.addPage()

    expect(document.querySelectorAll('#mess-main section.page').length).toBe(1)
  })

  it('does nothing when reserved page id confirmation is declined', async () => {
    const wrapper = makeWrapper('Demo')
    window.prompt.mockReturnValue('Home')
    window.confirm.mockReturnValue(false)
    await nextTick()

    wrapper.vm.addPage()

    expect(document.querySelectorAll('#mess-main section.page').length).toBe(1)
  })

  it('preserves manual nav link edits when refreshNavigationMenus runs', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    main.appendChild(secondPage)

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    wrapper.vm.refreshNavigationMenus()
    await nextTick()

    const nav = document.querySelector('nav[data-navigation-menu="true"]')
    nav.setAttribute('data-auto-navigation', 'off')
    wrapper.vm.refreshNavigationMenus()
    await nextTick()

    const homeLink = Array.from(nav.querySelectorAll('.navigation-menu__link'))
      .find((link) => link.textContent.trim() === 'Home')
    homeLink.setAttribute('href', '#contact')
    homeLink.textContent = 'Contact'

    wrapper.vm.refreshNavigationMenus()
    await nextTick()

    const links = Array.from(nav.querySelectorAll('.navigation-menu__link')).map((link) => ({
      label: link.textContent.trim(),
      href: link.getAttribute('href')
    }))

    expect(links.some((link) => link.label === 'Contact' && link.href === '#contact')).toBe(true)
  })

  it('does not double-handle clicks from mounted navigation component links', async () => {

    const wrapper = makeWrapper('Demo')
    await nextTick()

    const main = document.querySelector('#mess-main')
    const secondPage = document.createElement('section')
    secondPage.className = 'page'
    secondPage.id = 'contact'
    main.appendChild(secondPage)

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    wrapper.vm.refreshNavigationMenus()
    await nextTick()

    window.history.replaceState({}, '', '/#home')
    const pushSpy = vi.spyOn(window.history, 'pushState')
    const contactLink = Array.from(document.querySelectorAll('nav[data-navigation-menu="true"] .navigation-menu__link'))
      .find((link) => link.textContent.trim() === 'Contact')

    contactLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(pushSpy).not.toHaveBeenCalled()
    pushSpy.mockRestore()
  })

  it('unmounts nav app before removing a container that includes navigation', async () => {
    const wrapper = makeWrapper('Demo')
    await nextTick()

    wrapper.vm.html_location = document.querySelector('#mess-header')
    wrapper.vm.page_location = 'header'
    wrapper.vm.addNavigationMenu()
    await nextTick()
    await nextTick()

    const header = document.querySelector('#mess-header')
    const nav = header.querySelector('nav[data-navigation-menu="true"]')
    const container = document.createElement('div')
    header.appendChild(container)
    container.appendChild(nav)

    const unmountSpy = vi.spyOn(wrapper.vm, 'unmountNavigationMenuComponent')
    wrapper.vm.html_location = container
    wrapper.vm.page_location = 'header'

    wrapper.vm.removeEl()

    expect(unmountSpy).toHaveBeenCalledWith(nav)
    expect(nav.__navigationMenuApp).toBeNull()
    unmountSpy.mockRestore()
  })
})
