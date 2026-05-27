<template>
  <section class="edit-navigation" data-role="edit-navigation">
    <div class="edit-navigation__row">
      <button
        class="edit-navigation__toggle"
        type="button"
        :title="autoNavigationHint"
        @click="toggleAutoNavigation"
      >
        {{ autoNavigation ? 'Auto Navigation On' : 'Auto Navigation Off' }}
      </button>

      <button
        class="edit-navigation__toggle"
        type="button"
        :title="spsHint"
        @click="toggleSps"
      >
        {{ spsEnabled ? 'Single Page Scrolling On' : 'Single Page Scrolling Off' }}
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EditNavigation',
  props: {
    autoNavigation: {
      type: Boolean,
      default: true
    },
    spsEnabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:autoNavigation', 'update:spsEnabled'],
  computed: {
    autoNavigationHint () {
      return this.autoNavigation ? 'automatically syncs to available pages' : 'user editable'
    },
    spsHint () {
      return this.spsEnabled
        ? 'navigable pages are accessed with the menu and scrolling'
        : 'navigable pages are accessed only with the menu'
    }
  },
  methods: {
    toggleAutoNavigation () {
      this.$emit('update:autoNavigation', !this.autoNavigation)
    },
    toggleSps () {
      this.$emit('update:spsEnabled', !this.spsEnabled)
    }
  }
}
</script>

<style scoped>
.edit-navigation {
  width: 100%;
}

.edit-navigation__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.edit-navigation__toggle {
  margin: 0;
  cursor: pointer;
}
</style>
