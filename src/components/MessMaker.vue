<template>
  <section id="mess-body">
    <div id="mess-header" v-html="header" @mouseover="updatePageLocation('header')"></div>
    <div id="mess-main" v-html="main" @mouseover="updatePageLocation('main')"></div>
    <div id="mess-footer" v-html="footer" @mouseover="updatePageLocation('footer')"></div>
  </section>
</template>

<script>

import { menuEventBus, projectDataBus } from '../main'
export default {
  name: 'Mess',
  data () {
    return {
      name: '',
      page_location: '',
      html_location: {},
      header: '',
      main: '',
      footer: '',
      js: '',
      css: '',
      mess: ''
    }
  },
  methods: {
    cleanMess () {
      this.name = ''
      this.page_location = ''
      this.html_location = {}
      this.header = ''
      this.main = ''
      this.footer = ''
      this.js = ''
      this.css = ''
      this.mess = ''
    },

    makeAMess (bool) {
      if (bool === 'true') {
        var theMess = this.$data
        // this.name = theMess.name === '' && localStorage.name === '' ? projectDataBus.name : theMess.name
        if (typeof theMess.header === 'string') this.updateHeader(theMess.header)
        if (typeof theMess.main === 'string') this.updateMain(theMess.main)
        if (typeof theMess.footer === 'string') this.updateFooter(theMess.footer)
      } else {
        this.name = projectDataBus.name || this.name
        this.header = projectDataBus.header || this.header
        this.main = projectDataBus.main || this.main
        this.footer = projectDataBus.footer || this.footer
        this.js = projectDataBus.js || this.js
        this.css = projectDataBus.css || this.css
        this.mess = projectDataBus.mess || this.mess
        this.$forceUpdate()
      }
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

    updateMess () {
      switch (this.page_location) {
        case 'header':
          let newHeader = document.querySelector('#mess-header').innerHTML
          this.updateHeader(newHeader)
          break
        case 'main':
          let newMain = document.querySelector('#mess-main').innerHTML
          this.updateMain(newMain)
          break
        case 'footer':
          let newFooter = document.querySelector('#mess-footer').innerHTML
          this.updateFooter(newFooter)
          break
      }
      let theMess = JSON.stringify(this.$data)
      this.mess = this.hashMess(theMess)
    },

    updateHeader (newHeader) {
      let headerContent = newHeader || '<h1>Remove me and add header content!</h1>'
      this.header = headerContent
    },

    updateMain (newMain) {
      let mainContent = newMain || '<h1>Remove me and add main content!</h1>'
      this.main = mainContent
    },

    updateFooter (newFooter) {
      let footerContent = newFooter || '<h1>Remove me and add footer content!</h1>'
      this.footer = footerContent
    },

    updateJs (newJs) {
      let jsContent = newJs || '// SCRIPTS'
      this.js = jsContent
    },

    updateCss (newCss) {
      let cssContent = newCss || '/* STYLES */'
      this.css = cssContent
    },

    updatePageLocation (location) {
      this.page_location = location
    },

    updateHtmlLocation (newTarget) {
      this.html_location = newTarget
    },

    removeEl () {
      var removeTarget = this.html_location
      removeTarget.remove()
      this.updateMess()
    },

    addDiv (divClass) {
      var newDiv = document.createElement('div')
      var divTarget = this.html_location
      var divTargetClassList = divTarget.classList
      var divTargetParent = divTarget.parentNode
      newDiv.classList.add(divClass, 'unstyled')
      switch (divClass) {
        case 'row':
          if (divTargetClassList.contains('row')) divTargetParent.insertBefore(newDiv, divTarget)
          else divTarget.appendChild(newDiv)
          break
        case 'column':
          if (divTargetClassList.contains('column')) divTargetParent.insertBefore(newDiv, divTarget)
          else divTarget.appendChild(newDiv)
          break
        default:
          divTarget.appendChild(newDiv)
      }
      this.updateMess()
    }
  },
  created () {
    menuEventBus
      .$on('mess-made', (bool) => this.makeAMess(bool))
      .$on('clean-mess', () => this.cleanMess())
      .$on('update-mess', () => this.updateMess())
      .$on('import-mess', (bool) => this.makeAMess(bool))
      .$on('location-update', (newTarget) => this.updateHtmlLocation(newTarget))
      .$on('remove-element', () => this.removeEl())
      .$on('add-div', (divClass) => this.addDiv(divClass))
  },
  mounted () {
    if (localStorage.getItem('mess') !== null) {
      this.name = localStorage.name
      this.page_location = localStorage.page_location || this.page_location
      this.html_location = localStorage.html_location || this.html_location
      this.header = localStorage.header || this.header
      this.main = localStorage.main || this.main
      this.footer = localStorage.footer || this.footer
      this.js = localStorage.js || this.js
      this.css = localStorage.css || this.css
      this.mess = localStorage.mess || this.mess
    }
    if (projectDataBus.name === '' && localStorage.getItem('name') !== null) this.makeAMess('true')
  },
  watch: {
    name (newName) {
      localStorage.name = newName
    },

    page_location (newPageLocation) {
      localStorage.page_location = newPageLocation
    },

    html_location (newHtmlLocation) {
      localStorage.html_location = newHtmlLocation
    },

    header (newHeader) {
      localStorage.header = newHeader
    },

    main (newMain) {
      localStorage.main = newMain
    },

    footer (newFooter) {
      localStorage.footer = newFooter
    },

    js (newJs) {
      localStorage.js = newJs
    },

    css (newCss) {
      localStorage.css = newCss
    },

    mess (newMess) {
      localStorage.mess = newMess
    }
  }
}

</script>

<style lang="scss" scoped>

/* MESS STYLES */

#mess-body {
  width: 100%; min-height: 100vh;
  > [id^="mess-"] { position: relative; transition: all 0.3s;
    &::before { position:absolute; top:50%; right: 50%; transform: translate(50%,-50%); transition: all 0.3s; color: rgba(0,0,0,0.15); font-weight: 900; font-size: 5vmin;}
    &:hover { background: lightblue;}
    &:hover::before { color: transparent;}
  }
}

#mess-header {
  width: 100%; height: 15vh;
  &::before { content: 'HEADER';}
}

#mess-main {
  width: 100%; height: 70vh; display: flex; flex-direction: column;
  &::before { content: 'MAIN';}
}

#mess-footer {
  width: 100%; height: 15vh;
  &::before { content: 'FOOTER';}
}

</style>
