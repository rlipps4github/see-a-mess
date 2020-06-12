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
      <template v-if="currentMenu !== 'home'">
        <li @click="menuClick('Back')">Back</li>
      </template>
        <li @click="menuClick('Cancel')">Close</li>
    </ul>
  </div>
</template>

<script>

import { menuEventBus } from '../main'

import ImportForm from './Import'

export default {
  name: 'ModalMenu',
  data () {
    return {
      currentMenu: 'file',
      homeList: [
        'File',
        'Add',
        'Edit',
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
        'Add Logo',
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
        case 'Add Primative':
          this.addPrimatives()
          break
        case 'Remove':
          this.removeSelection()
          break
        case 'Add Row':
          this.addDiv('row')
          break
        case 'Add Column':
          this.addDiv('column')
          break
        case 'Add DIV':
          this.addDiv('content')
          break
        case 'Back':
          if (this.currentMenu === 'primative') this.setMenu('add')
          else this.setMenu('home')
          break
        case 'Cancel':
          this.closeMenu()
          break
        default:
          this.closeMenu()
      }
    },

    createData () {
      // load initial setup if no data is saved
      if (localStorage.getItem('name') === null) {
        menuEventBus.$emit('mess-made', 'true')
        this.closeMenu()
      } else {
        var startOver = confirm('All data will be erased!\n Are you sure you want to start over?')
        if (startOver) {
          menuEventBus.$emit('clean-mess', true)
          menuEventBus.$emit('mess-made', 'true')
          this.closeMenu()
        }
      }
    },

    exportFile () {
      let theMess = JSON.parse(localStorage.getItem('mess')) || false
      if (theMess) console.save(theMess, [localStorage.name + '.txt'])
      this.closeMenu()
    },

    closeMenu () {
      menuEventBus.$emit('menu-closed', true)
    },

    initMenu () {
      if (localStorage.name !== undefined && this.currentMenu === 'file') this.currentMenu = 'home'
    },

    setMenu (menuSelection) {
      if (menuSelection !== '') this.currentMenu = menuSelection
    },

    addPrimatives () {
      this.currentMenu = 'primative'
    },

    removeSelection () {
      menuEventBus.$emit('remove-element', true)
      this.closeMenu()
    },

    addDiv (divClass) {
      menuEventBus.$emit('add-div', divClass)
      this.closeMenu()
    }
  },
  components: {
    ImportForm
  },
  created () {
    this.initMenu()
  }
}

</script>

<style lang="scss" scoped>

@mixin randomize {
  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      font-size: 2+random(2)+vmin;
      transform: translate( random(7)+#{$i}+vw , random(7)+#{$i}+vw );
      animation: shuffle 5s infinite;
      transition: transform random(5)+#{$i}+s;
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
}

</style>
