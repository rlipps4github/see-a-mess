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
    initMess () {
      if (this.name === '') {
        if (projectDataBus.name !== null) this.updateMess('')
        else {
          console.log('bad data - cleaning the mess')
          menuEventBus.$emit('wipe-mess-db')
        }
      }
    },

    cleanMess () {
      this.name = ''
      this.page_location = ''
      this.html_location = {}
      this.header = ''
      this.main = ''
      this.footer = ''
      this.js = ''
      this.css = ''
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
          this.name = projectDataBus.name
          this.header = projectDataBus.header
          this.main = projectDataBus.main
          this.footer = projectDataBus.footer
          this.Js = projectDataBus.js
          this.Css = projectDataBus.css
          break
        default:
          console.log('mess db -> html')
          this.name = projectDataBus.name
          let theHeader = projectDataBus.header
          let theMain = projectDataBus.main
          let theFooter = projectDataBus.footer
          let theJs = projectDataBus.js
          let theCss = projectDataBus.css
          this.updateHeader(theHeader)
          this.updateMain(theMain)
          this.updateFooter(theFooter)
          this.updateJs(theJs)
          this.updateCss(theCss)
          this.$forceUpdate()
      }
    },

    exportMess () {
      let theObj = {name: this.name, header: this.header, main: this.main, footer: this.footer, js: this.js, css: this.css}
      let theMess = this.hashMess(JSON.stringify(theObj))
      if (theMess) console.save(theMess, [this.name + '.mess'])
      this.closeMenu()
    },

    updateHeader (newHeader) {
      let headerContent = newHeader || this.header
      this.header = headerContent
      if (projectDataBus.header !== headerContent) {
        projectDataBus.header = headerContent
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateMain (newMain) {
      let mainContent = newMain || this.main
      this.main = mainContent
      if (projectDataBus.main !== mainContent) {
        projectDataBus.main = mainContent
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateFooter (newFooter) {
      let footerContent = newFooter || this.footer
      this.footer = footerContent
      if (projectDataBus.footer !== footerContent) {
        projectDataBus.footer = footerContent
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateJs (newJs) {
      let jsContent = newJs || this.js
      this.js = jsContent
      if (projectDataBus.js !== jsContent) {
        projectDataBus.js = jsContent
        menuEventBus.$emit('set-mess-db')
      }
    },

    updateCss (newCss) {
      let cssContent = newCss || this.css
      this.css = cssContent
      if (projectDataBus.css !== cssContent) {
        projectDataBus.css = cssContent
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
      let theRows = parent.getElementsByClassName('row')
      for (var i = 0; i < theRows.length; i++) {
        theRows.item(i).classList.remove('row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7', 'row-8', 'row-9', 'row-10', 'row-11', 'row-12')
        theRows.item(i).classList.add('row-' + theRows.length)
      }
    },

    updateColumns (parent) {
      let theColumns = parent.getElementsByClassName('column')
      for (var i = 0; i < theColumns.length; i++) {
        theColumns.item(i).classList.remove('col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12')
        theColumns.item(i).classList.add('col-' + theColumns.length)
      }
    },

    addEl (data = {}) {
      let addTarget = this.html_location
      let newElement = document.createElement(data.tag)
      newElement.classList.add(data.class || 'unstyled')
      addTarget.append(newElement)
    },

    removeEl () {
      let removeTarget = this.html_location
      let removeTargetParent = removeTarget.parentNode
      removeTarget.remove()
      if (removeTarget.classList.contains('row')) this.updateRows(removeTargetParent)
      if (removeTarget.classList.contains('column')) this.updateColumns(removeTargetParent)
      this.updateMess(this.page_location)
    },

    addDiv (divClass) {
      let newDiv = document.createElement('div')
      let divTarget = this.html_location
      let divTargetClassList = divTarget.classList
      let divTargetParent = divTarget.parentNode
      newDiv.classList.add(divClass, 'unstyled')
      switch (divClass) {
        case 'row':
          if (divTargetClassList.contains('row')) {
            divTargetParent.insertBefore(newDiv, divTarget)
            this.updateRows(divTargetParent)
          } else {
            divTarget.appendChild(newDiv)
          }
          break
        case 'column':
          if (divTargetClassList.contains('column')) {
            divTargetParent.insertBefore(newDiv, divTarget)
            this.updateColumns(divTargetParent)
          } else {
            divTarget.appendChild(newDiv)
          }
          break
        default:
          divTarget.appendChild(newDiv)
      }
      this.updateMess(this.page_location)
    },

    addImg (img) {
      let newImg = document.createElement('img')
      let imgTarget = this.html_location
      if (img.name && img.file) {
        newImg.src = 'data:image/png;base64,' + img.file
        newImg.setAttribute('alt', img.name)
        imgTarget.appendChild(newImg)
        if (!imgTarget.hasChildNodes()) imgTarget.parentNode.insertBefore(newImg, imgTarget)
      }
      this.updateMess()
    }
  },
  created () {
    this.initMess()
    menuEventBus
      .$on('clean-mess-maker', () => this.cleanMess())
      .$on('export-mess', () => this.exportMess())
      .$on('refresh-mess-maker', (messTarget) => this.updateMess(messTarget))
      .$on('location-update', (newTarget) => this.updateHtmlLocation(newTarget))
      .$on('remove-element', () => this.removeEl())
      .$on('add-div', (divClass) => this.addDiv(divClass))
      .$on('add-element', (data) => this.addEl(data))
      .$on('add-image', (imgName) => this.addImg(imgName))
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
  > section { height: 100%;}
}

#mess-footer {
  width: 100%; height: 15vh;
  &::before { content: 'FOOTER';}
}

</style>
