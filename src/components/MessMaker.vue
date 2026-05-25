<template>
  <section id="mess-body">
    <div id="mess-header" v-html="header" @mouseover="updatePageLocation('header')"></div>
    <div id="mess-main" v-html="main" @mouseover="updatePageLocation('main')"></div>
    <div id="mess-footer" v-html="footer" @mouseover="updatePageLocation('footer')"></div>
  </section>
</template>

<script>

import { menuEventBus } from '../main.js'

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
      this.updateMess(this.page_location)
    },

    addEl (tagname) {
      this.clearPulseEffect()
      let addTarget = this.html_location
      let newElement = document.createElement(tagname)
      addTarget.append(newElement)
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
      this.updateMess()
    },

    removeEl () {
      let removeTarget = this.html_location
      let removeTargetParent = removeTarget.parentNode
      removeTarget.remove()
      if (removeTarget.classList.contains('row')) this.updateRows(removeTargetParent)
      if (removeTarget.classList.contains('column')) this.updateColumns(removeTargetParent)
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
