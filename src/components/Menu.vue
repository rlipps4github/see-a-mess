<template>
  <div class="modal">
    <ul id="menu">
      <template v-if="currentMenu === 'file'">
        <li v-for="(item,index) in fileList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
      </template>
      <template v-if="currentMenu === 'home'">
        <li v-for="(item,index) in homeList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
      </template>
      <template v-if="currentMenu === 'add'">
        <li v-for="(item,index) in moduleList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
      </template>
      <template v-if="currentMenu === 'primative'">
        <li v-for="(item,index) in primativeList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
        <li v-for="(item,index) in textList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
      </template>
      <template v-if="currentMenu === 'text'">
        <li v-for="(item,index) in textList" :key="item+index" @click="menuClick(item)">{{ item }}</li>
      </template>
      <template v-if="currentMenu === 'import'">
        <li><import-file></import-file></li>
      </template>
      <template v-if="currentMenu === 'import-image'">
        <li><import-image></import-image></li>
      </template>
      <template v-if="currentMenu === 'edit'">
        <li><edit></edit></li>
      </template>
      <template v-if="currentMenu !== 'home' && currentMenu !== 'edit'">
        <li @click="menuClick('Back')">Back</li>
      </template>
      <template v-if="currentMenu !== 'edit'">
        <li @click="menuClick('Close')">Close</li>
      </template>
    </ul>
  </div>
</template>

<script>

import { menuEventBus } from '../main.js'

import ImportFile from './Import.vue'
import ImportImage from './ImportImg.vue'
import Edit from './EditElement.vue'

export default {
  name: 'ModalMenu',
  data () {
    return {
      currentMenu: 'file',
      currentPrimitive: null,
      currentEl: {},
      homeList: [
        'File',
        'Edit',
        'Add',
        'Remove'
      ],
      fileList: [
        'New',
        'Open',
        'Save'
      ],
      moduleList: [
        'Add Row',
        'Add Column',
        'Add Text',
        'Add Image',
        'Add Menu',
        'Add Contact',
        'Add Primative'
      ],
      primativeList: [
        'Add DIV',
        'Add SPAN',
        'Add Un-ordered List',
        'Add Ordered List'
      ],
      textList: [
        'Add H1',
        'Add H2',
        'Add H3',
        'Add H4',
        'Add H5',
        'Add H6',
        'Add Paragraph',
        'Add Link'
      ]
    }
  },
  methods: {
    menuClick (menuItem) {
      switch (menuItem) {
        case 'File':
          this.setMenu('file')
          break
        case 'Add':
          this.setMenu('add')
          break
        case 'Edit':
          this.setMenu('edit')
          break
        case 'New':
          this.createData()
          break
        case 'Open':
          this.setMenu('import')
          break
        case 'Save':
          this.exportFile()
          break
        case 'Add Row':
          this.addDiv('row')
          break
        case 'Add Column':
          this.addDiv('column')
          break
        case 'Add Text':
          this.setMenu('text')
          break
        case 'Add Image':
          this.setMenu('import-image')
          break
        case 'Add Primative':
          this.setMenu('primative')
          break
        case 'Add DIV':
          this.addDiv('content')
          break
        case 'Add H1':
        case 'Add H2':
        case 'Add H3':
        case 'Add H4':
        case 'Add H5':
        case 'Add H6':
        case 'Add Paragraph':
          this.currentPrimitive = menuItem.replace('Add ', '').replace('aragraph', '')
          this.addText()
          this.closeMenu()
          break
        case 'Add Link':
          this.currentPrimitive = 'A'
          this.addText()
          this.closeMenu()
          break
        case 'Remove':
          this.removeSelection()
          break
        case 'Back':
          if (this.currentMenu === 'primative' || this.currentMenu === 'text') this.setMenu('add')
          else this.setMenu('home')
          break
        case 'Close':
          this.closeMenu()
          break
        default:
          this.closeMenu()
      }
    },

    createData () {
      // load initial setup if no data is saved
      if (this.$store.state.name === null) {
        menuEventBus.$emit('new-mess')
        this.closeMenu()
      } else {
        var startOver = confirm('All data will be erased!\n Are you sure you want to start over?')
        if (startOver) {
          menuEventBus.$emit('clean-mess-maker')
        }
      }
    },

    exportFile () {
      menuEventBus.$emit('export-mess')
      this.closeMenu()
    },

    closeMenu () {
      menuEventBus.$emit('close-menu')
    },

    initMenu (status) {
      if (status === 'dirty' && this.currentMenu === 'file') this.currentMenu = 'home'
    },

    setMenu (menuSelection) {
      if (menuSelection !== '') this.currentMenu = menuSelection
      console.log('menu: ' + menuSelection)
    },

    removeSelection () {
      menuEventBus.$emit('remove-element', true)
      this.closeMenu()
    },

    addDiv (divClass) {
      menuEventBus.$emit('add-div', divClass)
      this.closeMenu()
    },

    addText () {
      menuEventBus.$emit('add-text', this.currentPrimitive)
      this.closeMenu()
    },

    updateCurrentEl (newTarget) {
      this.currentEl = newTarget
    }
  },
  components: {
    ImportFile,
    ImportImage,
    Edit
  },
  watch: {
    currentEl: function (newEl) {
      if (newEl.tagName !== undefined) this.currentEl.setAttribute('data-pulse', true)
    }
  },
  created () {
    this.currentEl = this.$store.state.html_location
    menuEventBus
      .$on('add-image', () => this.closeMenu())
      .$on('init-menu', (status) => this.initMenu(status))
      .$on('close-menu', () => this.setMenu('home'))
      .$on('home-menu', () => this.setMenu('home'))
      .$on('location-update', (newTarget) => this.updateCurrentEl(newTarget))
  }
}

</script>

<style lang="scss" scoped>

@use 'sass:math';

@mixin randomize {
  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      font-size: #{2 + math.random(3)}vmin;
    }
  }
}

@keyframes shuffle {
  0% {
    transform: translate(0,0)
  }
  50% {
    transform: translate(#{math.random(1)}vw, #{math.random(1)}vw)
  }
  100% {
    transform: translate(0,0)
  }
}

.modal {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  background: rgba(0,0,0,0.66);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

#menu {
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    position: relative;
    color: rgba(white, 0.66);
    cursor: pointer;
    z-index: 1;

    &:hover {
      color: white;
      text-shadow: 0 0 10px #41B883;
      animation-play-state: paused;
      z-index: 10;
    }

    @include randomize();
  }

  :deep(form) {
    padding: 10px;
    margin: 0 0 20px;
    background: rgba(255,255,255,0.25);
    font-size: 16px;

    input {
      padding: 5px;
      border: 1px solid;
      border-radius: 5px;
      margin: 0 0 10px;
      background: rgba(255,255,255,0.25);
    }

    button {
      padding: 5px 15px;
      border-radius: 5px;
      font-weight: bold;
      text-transform: uppercase;
    }
  }
}

</style>
