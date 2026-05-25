<template>
  <section class="app-container">

    <div id="make-a-mess" v-if=" status == 'clean' ">
      <template v-if="dbLoaded === false">
        <div class="mess-logo"></div>
        <h2 v-html="intro"></h2>
      </template>
      <template v-else>
        <div class="mess-logo-spinner"></div>
      </template>
    </div>

    <main-menu v-show="showMenu"></main-menu>

    <mess v-if=" status === 'dirty' "></mess>

  </section>
</template>

<script>

import { menuEventBus } from '../main.js'

import MainMenu from './Menu.vue'
import Mess from './MessMaker.vue'

export default {
  name: 'HelloWorld',
  data () {
    return {
      intro: 'Don\'t See-A-Mess? Make one!<br><span>Right click to get started.</span>',
      status: 'clean',
      dbLoaded: true,
      showMenu: false
    }
  },
  components: {
    MainMenu,
    Mess
  },
  methods: {

    initMess () {
      let vm = this
      window.oncontextmenu = () => {
        vm.openMenu(event)
        return false
      }
      document.getElementById('app').addEventListener('keydown', (e) => {
        let isEditable = e.target.hasAttribute('contenteditable')
        let theCode = e.keyCode
        if (isEditable && theCode === 13 && !e.shiftKey) {
          e.preventDefault()
          menuEventBus.$emit('update-mess')
        }
      })
      this.status = this.$store.state.name === null ? 'clean' : 'dirty'
      menuEventBus.$emit('init-menu', this.status)
      this.dbLoaded = false
    },

    openMenu (event) {
      var newTarget = event.target
      this.showMenu = true
      menuEventBus.$emit('location-update', newTarget)
      this.$store.dispatch('updateTheLocation', newTarget)
    },

    closeMenu () {
      let highlightedEls = document.querySelectorAll('[data-pulse="true"]')
      highlightedEls.forEach((el) => el.removeAttribute('data-pulse'))
      this.showMenu = false
    },

    makeNewMess () {
      let messName = prompt('Please enter your website project name.', 'My Website')
      if (messName != null) {
        this.$store.commit('updateName', messName)
        menuEventBus.$emit('start-mess-db')
        this.status = 'dirty'
      }
    },

    showSavedMess () {
      this.status = 'dirty'
    },

    hideMess () {
      this.status = 'clean'
      this.dbLoaded = 'true'
    },

    showWelcome () {
      this.dbLoaded = 'false'
    }
  },
  created () {
    menuEventBus
      .$on('close-menu', () => this.closeMenu())
      .$on('show-mess', () => this.showSavedMess())
      .$on('hide-mess', () => this.hideMess())
      .$on('new-mess', () => this.makeNewMess())
      .$on('init-app', () => this.initMess())
  },
  unmounted () {
    window.oncontextmenu = () => { return true }
  }
}

</script>

<style lang="scss">

.app-container {
  color: #2c3e50;
  font-family: 'Avenir', Helvetica, sans-serif;
  text-align: center;
}

$green: #41B883;

#make-a-mess {
  width: 100vw;
  height: 100vh;
  background: rgb(152,152,152);
  background: linear-gradient(0deg, rgba(152,152,152,1) 0%, rgba(255,255,255,1) 53%, rgba(248,248,248,1) 67%, rgba(199,199,199,1) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  /* Animations */
  @keyframes pulse {
    0% {
      opacity: 0.5;
      background-color: coral;
    }
    50% {
      opacity: 1;
      background-color: $green;
    }
    100% {
      opacity: 0.5;
      background-color: coral;
    }
  }

  @keyframes spinner {
    0% {
      transform: rotate(0);
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    50% {
      transform: rotate(900deg);
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    100% {
      transform: rotate(1800deg);
    }
  }

  /* Welcome */

  h2 {
    font-weight: bolder;

    span {
      animation: pulse 2s infinite;
    }
  }

  .mess-logo {
    margin-bottom: 2vmin;
    display: block;
    position: relative;

    &:after {
      content: " ";
      display: block;
      border-radius: 50%;
      width: 0;
      height: 0;
      margin: 0;
      box-sizing: border-box;
      border: 15vmin solid #222;
      border-color: $green transparent $green transparent;
      animation: spinner 20s infinite;
    }
  }

  .mess-logo-spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;

    &:after {
      content: " ";
      display: block;
      border-radius: 50%;
      width: 0;
      height: 0;
      margin: 8px;
      box-sizing: border-box;
      border: 32px solid #222;
      border-color: $green transparent $green transparent;
      animation: spinner 1.2s infinite;
    }
  }
}

#mess-body [contenteditable="true"] {

  &:empty {
    width: 20px;
    height: 20px;
    background: rgba($green, 0.5);
    display: inline-block;
  }

  &:hover::after {
    content: 'Shift+Enter for New Line';
    position: absolute;
    top: -20px;
    right: 0;
    color: coral;
    font-weight: 500;
    font-size: 12px;
    white-space: nowrap;
  }
}

img[data-pulse="true"] {
  animation: pulse 0.5s infinite;
}

*[data-pulse="true"]::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  animation: pulse 0.5s infinite;
}

</style>
