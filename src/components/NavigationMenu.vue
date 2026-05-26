<template>
  <nav class="navigation-menu" data-role="navigation-menu">
    <button
      v-if="isMobile"
      class="navigation-menu__trigger"
      type="button"
      @click="toggleMobileMenu"
    >
      MENU
    </button>

    <ul
      v-if="!isMobile"
      class="navigation-menu__list"
    >
      <li v-for="page in pages" :key="page.id" class="navigation-menu__item">
        <a
          class="navigation-menu__link"
          :href="'#' + page.id"
          :aria-current="isActivePage(page.id) ? 'page' : null"
          @click="handleSelect(page, $event)"
        >
          {{ page.label }}
        </a>
      </li>
    </ul>

    <div
      v-if="isMobile && mobileMenuOpen"
      class="navigation-menu__overlay"
      @click.self="closeMobileMenu"
    >
      <section class="navigation-menu__dialog" aria-label="Navigation Menu">
        <button
          class="navigation-menu__close"
          type="button"
          aria-label="Close navigation menu"
          @click="closeMobileMenu"
        >
          Close
        </button>
        <ul class="navigation-menu__list navigation-menu__list--mobile-open">
          <li v-for="page in pages" :key="page.id" class="navigation-menu__item">
            <a
              class="navigation-menu__link"
              :href="'#' + page.id"
              :aria-current="isActivePage(page.id) ? 'page' : null"
              @click="handleSelect(page, $event)"
            >
              {{ page.label }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavigationMenu',
  props: {
    pages: {
      type: Array,
      default: () => []
    },
    autoNavigation: {
      type: Boolean,
      default: true
    },
    spsEnabled: {
      type: Boolean,
      default: true
    },
    mobileBreakpoint: {
      type: Number,
      default: 960
    }
  },
  emits: [
    'navigate',
    'open-mobile',
    'close-mobile',
    'update:autoNavigation',
    'update:spsEnabled'
  ],
  data () {
    return {
      mobileMenuOpen: false,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200
    }
  },
  computed: {
    isMobile () {
      return this.viewportWidth <= this.mobileBreakpoint
    },
    activeHashId () {
      if (typeof window === 'undefined') return ''
      return (window.location.hash || '').replace(/^#/, '').trim()
    }
  },
  mounted () {
    if (typeof window === 'undefined') return
    this.handleResize = () => {
      this.viewportWidth = window.innerWidth
      if (!this.isMobile && this.mobileMenuOpen) this.closeMobileMenu()
    }
    window.addEventListener('resize', this.handleResize)
  },
  unmounted () {
    if (this.handleResize) window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleSelect (page, event) {
      if (event) event.preventDefault()
      this.$emit('navigate', page)
      if (this.isMobile) this.closeMobileMenu()
    },
    isActivePage (pageId) {
      return this.activeHashId !== '' && this.activeHashId === pageId
    },
    openMobileMenu () {
      this.mobileMenuOpen = true
      this.$emit('open-mobile')
    },
    closeMobileMenu () {
      this.mobileMenuOpen = false
      this.$emit('close-mobile')
    },
    toggleMobileMenu () {
      if (this.mobileMenuOpen) this.closeMobileMenu()
      else this.openMobileMenu()
    }
  }
}
</script>

<style scoped>

.navigation-menu__list {
  list-style: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigation-menu__item {
  margin: 0.5rem 1rem;
}
.navigation-menu__trigger {
  cursor: pointer;
}

.navigation-menu__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
}

.navigation-menu__dialog {
  width: min(92vw, 560px);
  max-height: 85vh;
  overflow-y: auto;
  padding: 1rem;
  background: #fff;
  border: 2px solid #222;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.navigation-menu__close {
  margin-bottom: 0.75rem;
  cursor: pointer;
}
</style>
