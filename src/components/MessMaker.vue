<template>
  <section id="mess-body">
    <div id="mess-header" v-html="header" @mouseover="updatePageLocation('header')"></div>
    <div id="mess-main" v-html="main" @mouseover="updatePageLocation('main')"></div>
    <div id="mess-footer" v-html="footer" @mouseover="updatePageLocation('footer')"></div>
  </section>
</template>

<script>
import { createApp, h, reactive, nextTick } from 'vue'
import NavigationMenu from './NavigationMenu.vue'

import { buildPageTemplate, menuEventBus } from '../main.js'

export default {
  name: 'Mess',
  data () {
    return {
      name: null,
      page_location: '',
      html_location: {},
      header: '',
      main: '',
      footer: '',
      navClickHandler: null,
      hashChangeHandler: null,
      pendingNavigationTargetId: null,
      pendingNavigationNavEl: null,
      js: {},
      css: {}
    }
  },
  methods: {
    initMess () {
      if (this.name === null) {
        if (this.$store.state.name !== null) this.updateMess('')
        else {
          console.log('bad data - cleaning the mess')
          menuEventBus.$emit('wipe-mess-db')
        }
      }
    },

    cleanMess () {
      this.name = null
      this.page_location = ''
      this.html_location = {}
      this.header = ''
      this.main = ''
      this.footer = ''
      this.js = {}
      this.css = {}
      menuEventBus.$emit('wipe-mess-db')
    },

    hashMess (content, passcode = 'see-a-mess') {
      var result = []
      var passLen = passcode.length
      for (var i = 0; i < content.length; i++) {
        var passOffset = i % passLen
        var calAscii = (content.charCodeAt(i) + passcode.charCodeAt(passOffset))
        result.push(calAscii)
      }
      return JSON.stringify(result)
    },

    updateMess (messTarget = null) {
      let theTarget = messTarget || this.page_location
      switch (theTarget) {
        case 'header':
          console.log('updating the header from html')
          let newHeader = document.querySelector('#mess-header').innerHTML
          this.updateHeader(newHeader)
          break
        case 'main':
          console.log('updating the main from html')
          let newMain = document.querySelector('#mess-main').innerHTML
          this.updateMain(newMain)
          break
        case 'footer':
          console.log('updating the footer from html')
          let newFooter = document.querySelector('#mess-footer').innerHTML
          this.updateFooter(newFooter)
          break
        case 'import':
          console.log('mess import -> html')
          this.name = this.$store.state.name
          this.header = this.$store.state.header
          this.main = this.$store.state.main
          this.footer = this.$store.state.footer
          this.Js = this.$store.state.js
          this.Css = this.$store.state.css
          break
        default:
          console.log('data store -> html')
          this.name = this.$store.state.name
          let theHeader = this.$store.state.header
          let theMain = this.$store.state.main
          let theFooter = this.$store.state.footer
          let theJs = this.$store.state.js
          let theCss = this.$store.state.css
          this.updateHeader(theHeader)
          this.updateMain(theMain)
          this.updateFooter(theFooter)
          this.updateJs(theJs)
          this.updateCss(theCss)
      }
    },

    exportMess () {
      let theObj = {name: this.name, header: this.header, main: this.main, footer: this.footer, js: this.js, css: this.css}
      let theMess = this.hashMess(JSON.stringify(theObj))
      if (theMess) console.save(theMess, [this.name + '.mess'])
      menuEventBus.$emit('close-menu')
    },

    updateHeader (newHeader) {
      let headerContent = newHeader || this.header
      this.header = headerContent
      if (this.$store.state.header !== headerContent) {
        this.$store.commit('updateHeader', headerContent)
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateMain (newMain) {
      let mainContent = newMain || this.main
      this.main = mainContent
      if (this.$store.state.main !== mainContent) {
        this.$store.commit('updateMain', mainContent)
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateFooter (newFooter) {
      let footerContent = newFooter || this.footer
      this.footer = footerContent
      if (this.$store.state.footer !== footerContent) {
        this.$store.commit('updateFooter', footerContent)
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateJs (newJs) {
      let jsContent = newJs || this.js
      this.js = jsContent
      if (this.$store.state.js !== jsContent) {
        this.$store.commit('updateJs', jsContent)
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateCss (newCss) {
      let cssContent = newCss || this.css
      this.css = cssContent
      if (this.$store.state.css !== cssContent) {
        this.$store.commit('updateCss', cssContent)
        menuEventBus.$emit('set-mess-db')
      }
    },

    updatePageLocation (location) {
      this.page_location = location
    },

    updateHtmlLocation (newTarget) {
      this.html_location = newTarget
    },

    updateRows (parent) {
      let theRows = parent.children
      for (var i = 0; i < theRows.length; i++) {
        if (theRows.item(i).classList.contains('row')) {
          theRows.item(i).classList.remove('row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7', 'row-8', 'row-9', 'row-10', 'row-11', 'row-12')
          theRows.item(i).classList.add('row-' + theRows.length)
        }
      }
    },

    updateColumns (parent) {
      let theColumns = parent.children
      for (var i = 0; i < theColumns.length; i++) {
        if (theColumns.item(i).classList.contains('column')) {
          theColumns.item(i).classList.remove('col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12')
          theColumns.item(i).classList.add('col-' + theColumns.length)
        }
      }
    },

    clearPulseEffect () {
      let highlightedEls = document.querySelectorAll('[data-pulse="true"]')
      highlightedEls.forEach((el) => el.removeAttribute('data-pulse'))
    },

    derivePageLabel (pageEl, fallbackIndex = 1) {
      if (pageEl.getAttribute('data-page-name')) return pageEl.getAttribute('data-page-name')
      if (pageEl.id && pageEl.id.trim() !== '') {
        return pageEl.id
          .replace(/[-_]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      }
      return 'Page ' + fallbackIndex
    },

    getActivePages () {
      let pages = Array.from(document.querySelectorAll('#mess-main section.page'))
      return pages
        .filter((page) => page.id && page.id.trim() !== '')
        .map((page, index) => ({
          id: page.id,
          label: this.derivePageLabel(page, index + 1)
        }))
    },

    getNavigationPagesFromNode (nav) {
      if (!nav) return []
      return Array.from(nav.querySelectorAll('a[href^="#"]')).map((link) => {
        let href = link.getAttribute('href') || ''
        return {
          id: href.replace(/^#/, '').trim(),
          label: (link.textContent || '').trim()
        }
      }).filter((page) => page.id)
    },

    mountNavigationMenuComponent (nav) {
      if (!nav) return

      let autoNavigation = nav.getAttribute('data-auto-navigation') !== 'off'
      let manualPages = this.getNavigationPagesFromNode(nav)
      let state = reactive({
        pages: autoNavigation ? this.getActivePages() : manualPages,
        autoNavigation,
        spsEnabled: nav.getAttribute('data-sps-enabled') !== 'off',
        mobileBreakpoint: 960
      })

      let mountTarget = document.createElement('div')
      mountTarget.className = 'navigation-menu__mount'
      nav.innerHTML = ''
      nav.appendChild(mountTarget)

      let rootVm = this
      let app = createApp({
        name: 'NavigationMenuMount',
        setup () {
          return () => h(NavigationMenu, {
            pages: state.pages,
            autoNavigation: state.autoNavigation,
            spsEnabled: state.spsEnabled,
            mobileBreakpoint: state.mobileBreakpoint,
            onNavigate: (page) => {
              if (!page || !page.id) return
              rootVm.handleNavigationIntent(page.id, nav)
            },
            onOpenMobile: () => nav.setAttribute('data-mobile-menu', 'open'),
            onCloseMobile: () => nav.setAttribute('data-mobile-menu', 'closed')
          })
        }
      })

      app.mount(mountTarget)
      nav.__navigationMenuApp = app
      nav.__navigationMenuState = state
      nav.__navigationManualPages = manualPages
    },

    refreshNavigationMenuComponent (nav) {
      if (!nav || !nav.__navigationMenuState) {
        this.mountNavigationMenuComponent(nav)
        return
      }

      let state = nav.__navigationMenuState
      let autoNavigation = nav.getAttribute('data-auto-navigation') !== 'off'
      let wasAutoNavigation = state.autoNavigation
      state.autoNavigation = autoNavigation
      state.spsEnabled = nav.getAttribute('data-sps-enabled') !== 'off'

      if (autoNavigation) {
        state.pages = this.getActivePages()
      } else {
        if (wasAutoNavigation) nav.__navigationManualPages = state.pages.slice()

        let domManualPages = this.getNavigationPagesFromNode(nav)
        if (domManualPages.length > 0) {
          nav.__navigationManualPages = domManualPages
        }

        if (!Array.isArray(nav.__navigationManualPages) || nav.__navigationManualPages.length === 0) {
          nav.__navigationManualPages = state.pages.slice()
        }

        state.pages = nav.__navigationManualPages
      }
    },

    unmountNavigationMenuComponent (nav) {
      if (!nav || !nav.__navigationMenuApp) return
      nav.__navigationMenuApp.unmount()
      nav.__navigationMenuApp = null
      nav.__navigationMenuState = null
    },

    getPageSections () {
      return Array.from(document.querySelectorAll('#mess-main section.page'))
    },

    getTargetSectionById (targetId) {
      if (!targetId) return null
      return this.getPageSections().find((section) => section.id === targetId) || null
    },

    getDefaultNavigationMenu () {
      return document.querySelector('nav[data-navigation-menu="true"]')
    },

    getMessRegionElement (messTarget = null) {
      let target = messTarget || this.page_location
      switch (target) {
        case 'header':
          return document.querySelector('#mess-header')
        case 'main':
          return document.querySelector('#mess-main')
        case 'footer':
          return document.querySelector('#mess-footer')
        default:
          return null
      }
    },

    detachNavigationMenusInRegion (messTarget = null) {
      let region = this.getMessRegionElement(messTarget)
      if (!region) return

      let navs = region.querySelectorAll('nav[data-navigation-menu="true"]')
      navs.forEach((nav) => {
        if (!nav.__navigationMenuApp) return
        let markupSnapshot = nav.innerHTML
        this.unmountNavigationMenuComponent(nav)
        nav.innerHTML = markupSnapshot
      })
    },

    isSpsEnabled (navEl = null) {
      let targetNav = navEl || this.getDefaultNavigationMenu()
      if (!targetNav) return true
      return targetNav.getAttribute('data-sps-enabled') !== 'off'
    },

    shouldUseInstantScroll () {
      let isTouchDevice = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        (window.navigator && window.navigator.maxTouchPoints > 0)
      )
      let isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 960
      return isTouchDevice || isMobileViewport
    },

    getHeaderOffset () {
      let header = document.querySelector('#mess-header')
      if (!header || typeof header.getBoundingClientRect !== 'function') return 0
      return Math.max(0, Math.round(header.getBoundingClientRect().height))
    },

    setDocumentTitleFromSection (sectionEl) {
      if (!sectionEl) return
      let pageName = sectionEl.getAttribute('data-page-name') || this.derivePageLabel(sectionEl)
      if (pageName && typeof document !== 'undefined') document.title = pageName + ' | See a Mess?'
    },

    upsertMetaTag (selector, createAttrs, content) {
      if (typeof document === 'undefined') return
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        Object.keys(createAttrs).forEach((key) => meta.setAttribute(key, createAttrs[key]))
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    },

    setDocumentMetaFromSection (sectionEl) {
      if (!sectionEl) return
      let pageName = sectionEl.getAttribute('data-page-name') || this.derivePageLabel(sectionEl)
      let description = pageName + ' page in See a Mess?'
      let pageTitle = pageName + ' | See a Mess?'
      this.upsertMetaTag('meta[name="description"]', { name: 'description' }, description)
      this.upsertMetaTag('meta[property="og:title"]', { property: 'og:title' }, pageTitle)
      this.upsertMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' }, pageTitle)
    },

    setNavigationHistory (targetId, mode = 'push') {
      if (!targetId || typeof window === 'undefined' || !window.history) return
      let targetHash = '#' + targetId
      if (mode === 'replace') {
        window.history.replaceState({ targetId }, '', targetHash)
        return
      }
      if (window.location.hash === targetHash) {
        window.history.pushState({ targetId }, '', targetHash)
        return
      }
      window.location.hash = targetHash
    },

    handleNavigationIntent (targetId, navEl = null) {
      if (!targetId) return
      let targetHash = '#' + targetId
      let isCurrentHash = window.location.hash === targetHash

      if (isCurrentHash) {
        this.pendingNavigationTargetId = null
        this.pendingNavigationNavEl = null
      } else {
        this.pendingNavigationTargetId = targetId
        this.pendingNavigationNavEl = navEl
      }

      this.setNavigationHistory(targetId, 'push')
      if (isCurrentHash) this.navigateToSection(targetId, navEl)
    },

    navigateToSection (targetId, navEl = null) {
      let section = this.getTargetSectionById(targetId)
      if (!section) return

      let sections = this.getPageSections()
      let spsEnabled = this.isSpsEnabled(navEl)

      if (spsEnabled) {
        sections.forEach((item) => item.classList.remove('hidden'))
        let headerOffset = this.getHeaderOffset()
        let top = section.getBoundingClientRect().top + window.scrollY - headerOffset
        window.scrollTo({
          top,
          behavior: this.shouldUseInstantScroll() ? 'auto' : 'smooth'
        })
      } else {
        sections.forEach((item) => {
          if (item === section) item.classList.remove('hidden')
          else item.classList.add('hidden')
        })
      }

      this.setDocumentTitleFromSection(section)
      this.setDocumentMetaFromSection(section)
    },

    handleNavigationHashChange () {
      let hash = window.location.hash || ''
      let targetId = hash.replace(/^#/, '').trim()
      let contextualNavEl = null
      if (this.pendingNavigationTargetId === targetId && this.pendingNavigationNavEl) {
        contextualNavEl = this.pendingNavigationNavEl
      }

      if (!targetId) {
        let firstPage = this.getPageSections()[0]
        if (firstPage) {
          this.navigateToSection(firstPage.id, contextualNavEl || this.getDefaultNavigationMenu())
        }
        this.pendingNavigationTargetId = null
        this.pendingNavigationNavEl = null
        return
      }

      if (!this.getTargetSectionById(targetId)) {
        let firstPage = this.getPageSections()[0]
        if (firstPage) {
          this.navigateToSection(firstPage.id, contextualNavEl || this.getDefaultNavigationMenu())
        }
        this.pendingNavigationTargetId = null
        this.pendingNavigationNavEl = null
        return
      }

      this.navigateToSection(targetId, contextualNavEl)
      this.pendingNavigationTargetId = null
      this.pendingNavigationNavEl = null
    },

    bindNavigationHandlers () {
      this.navClickHandler = (event) => {
        let clickedLink = event.target && event.target.closest
          ? event.target.closest('nav[data-navigation-menu="true"] a[href^="#"]')
          : null
        if (!clickedLink) return

        let navEl = clickedLink.closest('nav[data-navigation-menu="true"]')
        let href = clickedLink.getAttribute('href') || ''
        let targetId = href.replace(/^#/, '').trim()
        if (!targetId) return

        event.preventDefault()
        this.handleNavigationIntent(targetId, navEl)
      }

      this.hashChangeHandler = () => this.handleNavigationHashChange()

      document.addEventListener('click', this.navClickHandler)
      window.addEventListener('hashchange', this.hashChangeHandler)
    },

    unbindNavigationHandlers () {
      if (this.navClickHandler) document.removeEventListener('click', this.navClickHandler)
      if (this.hashChangeHandler) window.removeEventListener('hashchange', this.hashChangeHandler)
      this.navClickHandler = null
      this.hashChangeHandler = null
    },

    applyInitialNavigationState () {
      if (window.location.hash && window.location.hash !== '#') {
        this.handleNavigationHashChange()
        return
      }
      let firstPage = this.getPageSections()[0]
      if (!firstPage) return
      if (!this.isSpsEnabled()) {
        this.navigateToSection(firstPage.id)
      }
    },

    refreshNavigationMenus () {
      let navs = document.querySelectorAll('nav[data-navigation-menu="true"]')
      navs.forEach((nav) => {
        this.refreshNavigationMenuComponent(nav)
      })
      this.handleNavigationHashChange()
    },

    getNavigationInsertTarget () {
      let target = this.html_location
      if (!target || typeof target.tagName !== 'string') {
        return document.querySelector('#mess-main')
      }
      if (target.tagName === 'IMG') return target.parentNode
      return target
    },

    normalizePageName (pageName) {
      return (pageName || '').trim().replace(/\s+/g, ' ')
    },

    slugifyPageName (pageName) {
      return this.normalizePageName(pageName)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    },

    createUniquePageId (baseId) {
      let fallbackBase = baseId || 'page'
      let id = fallbackBase
      let sequence = 2
      while (this.getTargetSectionById(id)) {
        id = fallbackBase + '-' + sequence
        sequence += 1
      }
      return id
    },

    isReservedPageId (pageId) {
      let reservedIds = ['home']
      return reservedIds.includes(pageId)
    },

    confirmReservedPageId (pageId) {
      return window.confirm('The page id "' + pageId + '" is reserved. Continue anyway?')
    },

    createPageElement (pageId, pageName) {
      let markup = buildPageTemplate(pageId)
      let pageTemplate = document.createElement('template')
      pageTemplate.innerHTML = markup.trim()
      let section = pageTemplate.content.firstElementChild
      if (!section) return null
      section.setAttribute('data-page-name', pageName)
      return section
    },

    addPage () {
      let rawPageName = window.prompt('Enter a page name (examples: About, Contact Us, Pricing).', 'New Page')
      if (rawPageName === null) return

      let pageName = this.normalizePageName(rawPageName)
      if (!pageName) return

      let baseId = this.slugifyPageName(pageName)
      if (this.isReservedPageId(baseId) && !this.confirmReservedPageId(baseId)) return
      let pageId = this.createUniquePageId(baseId || 'page')
      let pageSection = this.createPageElement(pageId, pageName)
      let mainTarget = document.querySelector('#mess-main')
      if (!pageSection || !mainTarget) return

      this.clearPulseEffect()
      mainTarget.appendChild(pageSection)
      this.page_location = 'main'
      this.refreshNavigationMenus()
      this.updateMess('main')
    },

    addNavigationMenu () {
      this.clearPulseEffect()
      let target = this.getNavigationInsertTarget()
      if (!target) return

      let nav = document.createElement('nav')
      nav.setAttribute('data-navigation-menu', 'true')
      nav.setAttribute('data-auto-navigation', 'on')
      nav.setAttribute('data-sps-enabled', 'on')
      nav.classList.add('navigation-menu', 'unstyled')

      target.appendChild(nav)
      this.updateMess(this.page_location)
      nextTick(() => {
        this.refreshNavigationMenus()
        this.applyInitialNavigationState()
      })
    },

    addText (tagname) {
      this.clearPulseEffect()
      let addTarget = this.html_location
      let newElement = document.createElement(tagname)
      let newElementText = document.createTextNode(tagname + ' text')
      let newElementLink = tagname === 'A' ? 'javascript:;' : null
      newElement.setAttribute('contenteditable', 'true')
      if (newElementLink) {
        newElement.setAttribute('href', newElementLink)
        newElement.setAttribute('target', '_blank')
      }
      newElement.appendChild(newElementText)
      if (addTarget.tagName === 'DIV') addTarget.append(newElement)
      else addTarget.parentElement.append(newElement)
      this.refreshNavigationMenus()
      this.updateMess(this.page_location)
    },

    addEl (tagname) {
      this.clearPulseEffect()
      let addTarget = this.html_location
      let newElement = document.createElement(tagname)
      addTarget.append(newElement)
      this.refreshNavigationMenus()
      this.updateMess(this.page_location)
    },

    addDiv (divClass) {
      this.clearPulseEffect()
      let newDiv = document.createElement('div')
      let divTarget = this.html_location
      let divTargetClassList = divTarget.classList
      let divTargetParent = divTarget.parentNode
      newDiv.classList.add(divClass, 'unstyled')
      switch (divClass) {
        case 'row':
          if (divTargetClassList.contains('row')) {
            divTargetParent.appendChild(newDiv)
            this.updateRows(divTargetParent)
          } else {
            divTarget.appendChild(newDiv)
          }
          break
        case 'column':
          if (divTargetClassList.contains('column')) {
            divTargetParent.appendChild(newDiv)
            this.updateColumns(divTargetParent)
          } else {
            divTarget.appendChild(newDiv)
          }
          break
        default:
          divTarget.appendChild(newDiv)
      }
      this.refreshNavigationMenus()
      this.updateMess(this.page_location)
    },

    addImg (img) {
      this.clearPulseEffect()
      let newImg = document.createElement('img')
      let imgTarget = this.html_location
      let targetTag = imgTarget.tagName
      if (img.name && img.file) {
        newImg.src = 'data:image/png;base64,' + img.file
        newImg.setAttribute('style', 'width: 100%;')
        newImg.setAttribute('alt', img.name)
        imgTarget.appendChild(newImg)
        if (targetTag === 'IMG') imgTarget.parentNode.appendChild(newImg)
        else imgTarget.appendChild(newImg)
      }
      this.refreshNavigationMenus()
      this.updateMess()
    },

    removeEl () {
      let removeTarget = this.html_location
      let navigationTargets = []

      if (removeTarget && typeof removeTarget.matches === 'function' && removeTarget.matches('nav[data-navigation-menu="true"]')) {
        navigationTargets.push(removeTarget)
      }
      if (removeTarget && typeof removeTarget.querySelectorAll === 'function') {
        navigationTargets.push(...removeTarget.querySelectorAll('nav[data-navigation-menu="true"]'))
      }
      navigationTargets.forEach((nav) => this.unmountNavigationMenuComponent(nav))

      let removeTargetParent = removeTarget.parentNode
      removeTarget.remove()
      if (removeTarget.classList.contains('row')) this.updateRows(removeTargetParent)
      if (removeTarget.classList.contains('column')) this.updateColumns(removeTargetParent)
      this.refreshNavigationMenus()
      this.updateMess(this.page_location)
    }
  },
  created () {
    this.initMess()
    menuEventBus
      .$on('clean-mess-maker', () => this.cleanMess())
      .$on('export-mess', () => this.exportMess())
      .$on('update-mess', () => this.updateMess())
      .$on('refresh-mess-maker', (messTarget) => this.updateMess(messTarget))
      .$on('location-update', (newTarget) => this.updateHtmlLocation(newTarget))
      .$on('remove-element', () => this.removeEl())
      .$on('add-div', (divClass) => this.addDiv(divClass))
      .$on('add-element', (tagname) => this.addEl(tagname))
      .$on('add-text', (tagname) => this.addText(tagname))
      .$on('add-image', (imgName) => this.addImg(imgName))
      .$on('add-page', () => this.addPage())
      .$on('add-navigation-menu', () => this.addNavigationMenu())
      .$on('refresh-navigation-menus', () => {
        this.detachNavigationMenusInRegion(this.page_location)
        this.updateMess(this.page_location)
        nextTick(() => {
          this.refreshNavigationMenus()
          this.applyInitialNavigationState()
        })
      })
  },
  mounted () {
    this.bindNavigationHandlers()
    nextTick(() => {
      this.refreshNavigationMenus()
      this.applyInitialNavigationState()
    })
  },
  unmounted () {
    this.unbindNavigationHandlers()
    let navs = document.querySelectorAll('nav[data-navigation-menu="true"]')
    navs.forEach((nav) => this.unmountNavigationMenuComponent(nav))
  }
}

</script>

<style lang="scss">

@use 'sass:math';

/* RESETS */

@import 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css';

html body {
  margin: 0;
  background: rgb(230,230,230);
  background: linear-gradient(0deg, rgba(199,199,199,1) 0%, rgba(255,255,255,1) 33%, rgba(255,255,255,1) 75%, rgba(230,230,230,1) 100%);

  * {
    padding: 0;
    margin: 0;
    position: relative;
    box-sizing: border-box;
    outline: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* START GLOBAL STYLESHEET */

#mess-body {
  width: 100%; min-height: 100vh;
  > [id^="mess-"] { position: relative; transition: all 0.3s;
    &::before { width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: flex; justify-content: center; align-items: center; transition: all 0.3s; color: rgba(0,0,0,0.15); font-weight: 900; font-size: 5vmin;}
    &:hover { background: lightblue;}
    &:hover::before { color: transparent;}
  }
}

#mess-header {
  width: 100%;
  min-height: 15vh;
  display: flex;
  align-items: center;

  &::before { content: 'HEADER';}
}

#mess-main {
  width: 100%;
  min-height: 70vh;
  display: flex;
  flex-direction: column;

  &::before { content: 'MAIN';}
  > section { height: 100%;}
}

#mess-footer {
  width: 100%;
  min-height: 15vh;
  display: flex;
  align-items: center;

  &::before { content: 'FOOTER';}
}

.page {
  height: 100%;
  padding: 1.5%;
  overflow: hidden;
}

.row {
  width: 100%;
  max-width: 1600px;
  height: 100%;
  padding: 1.5%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  &.row-reverse {
    flex-direction: row-reverse;
  }

  .column {
    width: 100%;
    height: 100%;
    padding: 1.5%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
  }
}

.content {
  padding: 2%;
  position: relative;
  overflow: hidden;
}

.full-width {
  width: 100%;
}

.hidden {
  display: none !important;
}

.unstyled {
  border: 1px dotted lightcoral;
  box-shadow: 0 0 5em rgba(0,0,0,0.1);

  &::before {
    content: attr(class);
    position: absolute;
    top: 0;
    left: 0;
    color: white;
    font-size: 0.8em;
    font-weight: 900;
    font-style: italic;
    transition: 0.3s;
    opacity: 0.5;
    pointer-events: none;
  }

  &:hover::before {
    color: red;
  }
}

@media (min-width: 640px) {

  .row {

    @for $i from 2 through 12 {
      $width: math.percentage(math.div(1, $i));

      &.row-#{$i} {
          height: $width;
      }
    }

    @for $i from 2 through 12 {
      $width: math.percentage(math.div(3, $i));

      .col-#{$i} {
          width: $width;
      }
    }
  }
}

@media (min-width: 960px) {

  .row {

    @for $i from 2 through 12 {
      $width: math.percentage(math.div(1, $i));

      &.row-#{$i} {
          height: $width;
      }
    }

    @for $i from 2 through 12 {
      $width: math.percentage(math.div(1, $i));

      .col-#{$i} {
          width: $width;
      }
    }
  }
}

/* END GLOBAL STYLESHEET */

</style>
