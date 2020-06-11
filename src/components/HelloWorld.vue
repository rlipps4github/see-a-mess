<template>
  <section class="app-container">
    <div id="make-a-mess" v-if=" status == 'clean' ">
      <img src="../assets/logo.png">
      <h2 v-html="intro"></h2>
    </div>
    <main-menu v-if="showMenu"></main-menu>
    <mess v-if=" status === 'dirty' "></mess>
  </section>
</template>

<script>

import { menuEventBus } from '../main'

import MainMenu from './Menu'
import Mess from './MessMaker'

export default {
  name: 'HelloWorld',
  data () {
    return {
      intro: 'Don\'t See-A-Mess? Make one!<br><span>Right click to get started.</span>',
      status: 'clean',
      showMenu: false
    }
  },
  methods: {

    contextMenu () {
      var vm = this
      window.oncontextmenu = () => {
        vm.showCustomMenu(event)
        return false
      }
      this.status = localStorage.getItem('name') == null ? 'clean' : 'dirty'
    },

    showCustomMenu (event) {
      var newTarget = event.target
      this.showMenu = true
      menuEventBus.$emit('location-update', newTarget)
    },

    closeCustomMenu () {
      this.showMenu = false
    },

    prepMess (bool) {
      if (bool === 'true') { // true means new mess
        let messName = prompt('Please enter your website project name.', 'My Website')
        if (messName != null) {
          localStorage.name = messName
          this.status = 'dirty'
        }
      } else { // false means just show the mess
        this.status = 'clean'
        this.status = 'dirty'
      }
    }
  },
  components: {

    MainMenu,
    Mess

  },
  created () {
    this.contextMenu()
    menuEventBus
      .$on('menu-opened', () => this.showCustomMenu())
      .$on('menu-closed', () => this.closeCustomMenu())
      .$on('mess-made', (bool) => this.prepMess(bool))
      .$on('import-mess', (bool) => this.prepMess(bool))
      .$emit('update-menu', true)
  },
  destroyed () {
    window.oncontextmenu = () => { return true }
  }
}

</script>

<style lang="scss">

#make-a-mess {

  @keyframes pulse {
    0% {
      opacity: 0.1;
      text-shadow: 0 0 2px #000;
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 10px #41B883;
    }
    100% {
      opacity: 0.1;
      text-shadow: 0 0 2px #000;
    }
  }

  h2 {
    font-weight: bolder;

    span {
      animation: pulse 2s infinite;
    }
  }
}

.unstyled {
  padding: 1em;
  border: 1px dotted lightcoral;
  box-shadow: 0 0 10em rgba(0,0,0,0.1);

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

  &.row {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;

    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

</style>
