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
      </template>
      <template v-if="currentMenu === 'import'">
        <li><import-form></import-form></li>
      </template>
      <template v-if="currentMenu === 'import-image'">
        <li><import-image></import-image></li>
      </template>
      <template v-if="currentMenu !== 'home'">
        <li @click="menuClick('Back')">Back</li>
      </template>
        <li @click="menuClick('Close')">Close</li>
    </ul>
  </div>
</template>

<script>

import { menuEventBus, projectDataBus } from '../main'

import ImportForm from './Import'
import ImportImage from './ImportImg'

export default {
  name: 'ModalMenu',
  data () {
    return {
      currentMenu: 'file',
      currentPrimitive: null,
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
        'Add Image',
        'Add Menu',
        'Add Contact',
        'Add Primative'
      ],
      primativeList: [
        'Add DIV',
        'Add H1',
        'Add H2',
        'Add H3',
        'Add H4',
        'Add H5',
        'Add H6',
        'Add Paragraph'
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
          this.currentPrimitive = menuItem.replace('Add ', '').replace(/[^a-z]/g, '')
          this.setMenu('element-panel')
          break
        case 'Remove':
          this.removeSelection()
          break
        case 'Back':
          if (this.currentMenu === 'primative') this.setMenu('add')
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
      if (projectDataBus.name === null) {
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

    initMenu () {
      if (projectDataBus.name !== null && this.currentMenu === 'file') this.currentMenu = 'home'
    },

    setMenu (menuSelection) {
      if (menuSelection !== '') this.currentMenu = menuSelection
    },

    removeSelection () {
      menuEventBus.$emit('remove-element', true)
      this.closeMenu()
    },

    addDiv (divClass) {
      menuEventBus.$emit('add-div', divClass)
      this.closeMenu()
    },

    addImage () {
      // import image
    }
  },
  components: {
    ImportForm,
    ImportImage
  },
  created () {
    this.initMenu()
    menuEventBus.$on('add-image', () => this.closeMenu())
  }
}

</script>

<style lang="scss" scoped>

@mixin randomize {
  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      font-size: 2+random(2)+vmin;
      // transform: translate( random(2)+#{$i}+vw , random(2)+#{$i}+vw );
      // animation: shuffle 5s infinite;
      // transition: transform random(5)+#{$i}+s;
    }
  }
}

@keyframes shuffle {
  0% {
    transform: translate(0,0)
  }
  50% {
    transform: translate( random(1)+vw , random(1)+vw )
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
    @include randomize();
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
  }

  >>> form {
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
