<template>
  <form>

    <template v-if=" currentOption == 'settings' ">

      <div class="heading-wrap">
        <a class="icon go-up" v-if=" status === 'clean' " v-show=" currentEl.parentElement && currentEl.id.indexOf('mess-') === -1 " @click.stop.prevent="gotoParent" title="Traverse to Parent">&uarr;</a>
        <a class="icon go-dn" v-if=" status === 'clean' " v-show=" currentEl.firstElementChild " @click.stop.prevent="gotoChild" title="Traverse to first Child">&darr;</a>
        <h3>
          Edit Styles
          <hr />
          <br />
          HTML TAG: {{ currentEl.tagName }} &nbsp;|&nbsp;
          ID: <span @keydown.enter.stop.prevent="handleEnter" @blur="updateId" contenteditable="true">{{ currentEl.id.replace('mess-','') }}</span> &nbsp;|&nbsp;
          CLASS: <span @keydown.enter.stop.prevent="handleEnter" @blur="updateClasslist" contenteditable="true">{{ currentEl.classList }}</span>
          <template v-if=" currentEl.tagName === 'A' ">
            &nbsp;|&nbsp; HREF: <span @keydown.enter.stop.prevent="handleEnter" @blur="updateHref" contenteditable="true">{{ currentEl.href }}</span>
          </template>
        </h3>
        <a class="icon go-lt" v-if=" status === 'clean' " v-show=" currentEl.previousElementSibling " @click.stop.prevent="gotoPrev" title="Traverse to previous Sibling">&larr;</a>
        <a class="icon go-rt" v-if=" status === 'clean' " v-show=" currentEl.nextElementSibling " @click.stop.prevent="gotoNext" title="Traverse to next Sibling">&rarr;</a>
      </div>

      <ul class="style-tiles">

        <template v-if=" currentEl.id.indexOf('mess-') === -1 ">
          <li v-for="(val, atr) in stylesList" :key="atr">
            <a class="icon remove" href="javascript:;" @click=" removeMe(atr,val) " title="Remove this style">X</a>
            <a class="icon search" :href=" searchMe(atr) " target="_blank" title="Search for references">?</a>
            <a class="icon info" :href=" schoolMe(atr) " target="_blank" title="Info">!</a>
            {{ atr.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => { return str.toUpperCase() }) }}:

            <div class="input-group" :data-attr="atr" v-if=" hasRange(val) ">
              <input id="range_input" name="range" type="range" min="0" max="100"  @keydown.enter.stop.prevent="handleEnter" @change="updateAttribs" :value=" parseInt(stylesList[atr]) " />
              <label class="hide" for="range">%</label><span>%</span>
            </div>

            <div class="input-group" :data-attr="atr" v-if=" hasColor(atr) ">
              <input name="color-input" id="color_input" type="color" pattern="#[0-9A-Fa-f]{6}" @keydown.enter.stop.prevent="handleEnter" @change="updateAttribs" :value=" rgbToHex(stylesList[atr]) " />
            </div>

            <div class="input-group" :data-attr="atr">
              <input name="text" type="text" @keydown.enter.stop.prevent="handleEnter" @change="updateAttribs" :value=" stylesList[atr] " />
            </div>
          </li>
        </template>

        <template v-else>
          <li class="full-width">
            <div class="full-width" id="css-text"></div>
          </li>
        </template>

      </ul>

      <button @click.stop.prevent="setMenu('add')">Add Styles</button>
      <button @click.stop.prevent="saveSelection">Save</button>
      <button v-if=" status === 'clean' " @click.stop.prevent="closeEdit">Back</button>

    </template>

    <template v-if=" currentOption == 'add' ">

      <h3>Add Styles</h3>
      <select id="selectStyle">
        <option value="">Select</option>
        <option v-for="(val, atr) in computedStyles" :key="atr" :data-val="val"> {{ atr.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => { return str.toUpperCase() }) }} </option>
      </select>

      <button @click.stop.prevent="addStyle">Add Style</button>
      <button @click.stop.prevent="setMenu('settings')">Back</button>

    </template>

    <button @click.stop.prevent="cancelEdit">CANCEL</button>

  </form>
</template>

<script>

import { menuEventBus } from '../main.js'

export default {
  name: 'Edit',
  data () {
    return {
      status: 'clean',
      styles: '',
      computedStyles: {},
      currentOption: 'settings',
      currentEl: {},
      currentTag: '',
      currentStyle: ''
    }
  },
  computed: {
    stylesList () {
      if (this.styles !== null) {
        let styleArr = this.styles.split(';')
        let styleList = {}
        styleArr.forEach((item, index) => { if (item.trim() !== '') styleList[item.trim().split(':')[0].trim()] = item.trim().split(':')[1].trim() })
        return styleList
      }
    }
  },
  methods: {
    setter (atr, val) {
      this.currentEl.style[atr] = val
      let currentStyles = this.currentEl.getAttribute('style') || ''
      let newStyle = atr.trim().replace(' ', '-') + ': ' + val + ';'
      this.styles = currentStyles + newStyle
    },

    lister (el) {
      this.computedStyles = {}
      let theList = getComputedStyle(el)
      for (const atr in theList) {
        if (isNaN(atr) && atr.length > 2 && atr.indexOf('ms') !== 0 && atr.indexOf('moz') === -1 && atr.indexOf('webkit') === -1 && typeof theList[atr] === 'string' && theList[atr] !== '') {
          if (theList[atr].indexOf('function') === -1) this.computedStyles[atr] = theList[atr]
        }
      }
    },

    gotoParent () {
      this.currentEl = this.currentEl.parentElement && typeof this.currentEl.parentElement.tagName === 'string' ? this.currentEl.parentElement : this.currentEl
    },

    gotoChild () {
      this.currentEl = this.currentEl.firstElementChild && typeof this.currentEl.firstElementChild.tagName === 'string' ? this.currentEl.firstElementChild : this.currentEl
    },

    gotoPrev () {
      this.currentEl = this.currentEl.previousElementSibling && typeof this.currentEl.previousElementSibling.tagName === 'string' ? this.currentEl.previousElementSibling : this.currentEl
    },

    gotoNext (nextSibling) {
      this.currentEl = this.currentEl.nextElementSibling && typeof this.currentEl.nextElementSibling.tagName === 'string' ? this.currentEl.nextElementSibling : this.currentEl
    },

    handleEnter (e) {
      if (e) {
        e.target.blur()
      }
    },

    hasRange (val) {
      return !isNaN(parseInt(val))
    },

    hasColor (atr) {
      return atr.toLowerCase().indexOf('color') > -1
    },

    rgbToHex (val) {
      if (val.indexOf('rgb(') !== -1) {
        let theNums = val.replace('rgb(', '').replace(')', '').split(',')
        let r = parseInt(theNums[0]).toString(16).length === 1 ? '0' + parseInt(theNums[0]).toString(16) : parseInt(theNums[0]).toString(16)
        let g = parseInt(theNums[1]).toString(16).length === 1 ? '0' + parseInt(theNums[1]).toString(16) : parseInt(theNums[1]).toString(16)
        let b = parseInt(theNums[2]).toString(16).length === 1 ? '0' + parseInt(theNums[2]).toString(16) : parseInt(theNums[2]).toString(16)
        return '#' + r + g + b
      } else return val
    },

    schoolMe (atr) {
      return 'https://developer.mozilla.org/en-US/docs/Web/CSS/' + atr.trim().replace(/\s/g, '-')
    },

    searchMe (atr) {
      return 'https://developer.mozilla.org/en-US/search?q=' + atr.trim().replace(/\s/g, '-')
    },

    removeMe (atr, val) {
      let currentStyles = this.currentEl.getAttribute('style') || ''
      let newStyle = atr.trim().replace(' ', '-') + ': ' + val + ';'
      this.styles = currentStyles.replace(newStyle, '')
      this.currentEl.style = this.styles
    },

    setMenu (option) {
      this.currentOption = option
    },

    setCurrentStyle (atr, val) {
      this.currentStyle = atr + ':' + val
    },

    saveSelection () {
      this.currentEl.removeAttribute('data-pulse')
      menuEventBus
        .$emit('update-mess')
        .$emit('close-menu')
    },

    updateAttribs (e) {
      let theAttr = e.target.parentNode.getAttribute('data-attr')
      let theVal = e.target.value
      let theIncrement = e.target.nextElementSibling !== null ? e.target.nextElementSibling.textContent : ''
      this.setter(theAttr, theVal + theIncrement)
      this.status = 'dirty'
    },

    updateClasslist (e) {
      let theClasslist = e.target.textContent.trim()
      this.currentEl.className = theClasslist
      this.status = 'dirty'
    },

    updateId (e) {
      let theId = e.target.textContent.trim()
      this.currentEl.id = theId
      this.status = 'dirty'
    },

    updateHref (e) {
      let theHref = e.target.textContent.trim()
      this.currentEl.href = theHref
      this.status = 'dirty'
    },

    addStyle () {
      let theOption = document.getElementById('selectStyle').selectedOptions[0]
      let theAtr = document.getElementById('selectStyle').value.toLowerCase().replace(' ', '-')
      let theVal = theOption.getAttribute('data-val')
      this.setter(theAtr, theVal)
      this.currentOption = 'settings'
    },

    cancelEdit () {
      this.currentEl.removeAttribute('data-pulse')
      location.reload()
    },

    closeEdit () {
      menuEventBus.$emit('home-menu')
    }
  },
  watch: {
    currentEl: function (newEl, oldEl) {
      if (oldEl.tagName !== undefined) oldEl.removeAttribute('data-pulse')
      this.currentEl.setAttribute('data-pulse', true)
      this.currentEl.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
      this.currentTag = this.currentEl.tagName
      this.styles = this.currentEl.getAttribute('style')
      this.lister(this.currentEl)
    }
  },
  created () {
    this.currentEl = this.$store.state.html_location
  }
}
</script>

<style lang="scss" scoped>

$green: #41B883;

form {
  width: 80vw;
  height: calc(80vh - 200px);

  .icon {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    position: absolute;
    background: #fff;
    color: $green;
    font-weight: 700;
    line-height: 20px;
    text-decoration: none;
    display: block;
    z-index: 10;

    &.remove {
      top: -10px;
      right: 10px;
    }

    &.search {
      top: -10px;
      right: 35px;
    }

    &.info {
      top: -10px;
      left: 10px;
    }

    &.go-up {
      top: -10px;
      left: calc(50% - 10px);
    }

    &.go-dn {
      bottom: -10px;
      left: calc(50% - 10px);
    }

    &.go-lt {
      bottom: -10px;
      left: calc(50% - 40px);
    }

    &.go-rt {
      bottom: -10px;
      left: calc(50% + 20px);
    }
  }

  .input-group {
    display: flex;
    align-items: center;

    input, label {
      margin: 0 5px !important;
      color: white;

      &[type="color"] {
        min-height: 2rem;
        padding: 2px;
      }
    }
  }
}

ul {
  max-height: 50vh;
  margin: 20px 0;
  overflow: hidden;
  overflow-y: auto;
  list-style: none;

  > * {
    margin: 2vh 2vw;
  }

  .heading-wrap {
    display: flex;
  }

  h3 {
    width: 100%;
    padding: 20px 0;
    background: rgba(255,255,255,0.25);
    text-transform: uppercase;

    [contenteditable="true"] {
      min-width: 20px;
      padding: 1px 15px;
      background-color: rgba($green, 0.5);
      display: inline-block;
    }
  }

  button {
    margin: 10px;

    &:focus {
      background: $green;
    }
  }
}

.hide {
  display: none;
}

.style-tiles {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;

  li {
    padding: 10px;
    border: 1px solid;
    border-radius: 5px;
    margin: 15px;
    position: relative;
    background: rgba(255,255,255,0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }
}

select {
  width: 200px;
}

textarea {
  min-height: 10vh;
}

</style>
