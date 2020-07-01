// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

const DB_NAME = 'see-a-mess-db'
const DB_VERSION = 1
const DB_STORE_NAME = 'mess'

const HeaderTemplate =
`<div class="row unstyled">
  <div class="column unstyled">
    <h1>Remove me and add header content!</h1>
  </div>
</div>`
const MainTemplate =
`<section id="home" class="page unstyled">
  <div class="row unstyled">
    <div class="column unstyled col-2">
      <div class="content unstyled">
        <h2>Remove me and add some content!</h2>
      </div>
    </div>
    <div class="column unstyled col-2">
      <div class="content unstyled"></div>
    </div>
  </div>
</section>`
const FooterTemplate =
`<div class="row unstyled">
  <div class="column unstyled col-3">
    <h3>Remove me and add footer content!</h3>
  </div>
  <div class="column unstyled col-3"></div>
  <div class="column unstyled col-3"></div>
</div>`

export const menuEventBus = new Vue()
export const projectDataBus = new Vue({
  data: {
    name: null,
    header: HeaderTemplate,
    main: MainTemplate,
    footer: FooterTemplate,
    js: [],
    css: { images: [], fonts: [], stylesheets: [] }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
    showMenu: false,
    db: null,
    ready: false,
    mess: []
  },
  methods: {
    async getDb () {
      return new Promise((resolve, reject) => {
        let request = window.indexedDB.open(DB_NAME, DB_VERSION)
        request.onerror = e => {
          console.log('Error opening db', e)
          reject(e)
        }
        request.onsuccess = e => {
          console.log('Opening db')
          resolve(e.target.result)
        }
        request.onupgradeneeded = e => {
          console.log('Creating Object Store')
          let db = e.target.result
          db.createObjectStore(DB_STORE_NAME)
        }
      })
    },

    async getMessFromDb () {
      return new Promise((resolve, reject) => {
        let tr = this.db.transaction([DB_STORE_NAME], 'readonly')
        tr.oncomplete = e => resolve(mess)
        let store = tr.objectStore(DB_STORE_NAME)
        let mess = []
        store.openCursor().onsuccess = e => {
          let cursor = e.target.result
          if (cursor) {
            mess.push(cursor.value)
            cursor.continue()
          }
        }
      })
    },

    async addMess (dirty = true) {
      if (dirty) console.log('update mess data bus -> mess db')
      else console.log('add mess data bus -> mess db')
      let mess = {
        name: projectDataBus.name,
        header: projectDataBus.header,
        main: projectDataBus.main,
        footer: projectDataBus.footer,
        js: projectDataBus.js,
        css: projectDataBus.css
      }
      if (dirty) await this.updateDB(mess)
      else await this.addMessDB(mess)
      this.mess = await this.getMessFromDb()
    },

    async addMessDB (mess) {
      return new Promise((resolve, reject) => {
        let tr = this.db.transaction([DB_STORE_NAME], 'readwrite')
        tr.oncomplete = e => resolve()
        let store = tr.objectStore(DB_STORE_NAME)
        store.add(mess, 0)
        console.log('new mess db added')
        menuEventBus.$emit('refresh-mess-maker', 'import')
      })
    },

    async updateDB (mess) {
      return new Promise((resolve, reject) => {
        let objectStore = this.db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME)
        let request = objectStore.get(0)
        request.onerror = e => console.log('error requesting mess db update:' + e.target.error)
        request.onsuccess = e => {
          let data = e.target.result
          data = mess
          let requestUpdate = objectStore.put(data, 0)
          requestUpdate.onerror = e => console.log('error updating mess db:' + e.target.error)
          requestUpdate.onsuccess = e => {
            console.log('mess db updated')
          }
        }
      })
    },

    async wipeMess () {
      this.mess = []
      projectDataBus.name = null
      projectDataBus.header = HeaderTemplate
      projectDataBus.main = MainTemplate
      projectDataBus.footer = FooterTemplate
      projectDataBus.js = []
      projectDataBus.css = { images: [], fonts: [], stylesheets: [] }
      let store = this.db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME)
      let req = store.clear()
      req.onsuccess = e => {
        console.log('mess db store removed')
        menuEventBus.$emit('close-menu')
        menuEventBus.$emit('new-mess')
      }
      req.onerror = e => console.error('clearObjectStore:', e.target.errorCode)
    },

    setProjectData () {
      if (this.mess[0] !== undefined) {
        projectDataBus.name = this.mess[0]['name']
        projectDataBus.header = this.mess[0]['header']
        projectDataBus.main = this.mess[0]['main']
        projectDataBus.footer = this.mess[0]['footer']
        projectDataBus.js = this.mess[0]['js']
        projectDataBus.css = this.mess[0]['css']
        console.log('found a mess = mess db -> data bus')
        menuEventBus.$emit('init-app')
      } else {
        menuEventBus.$emit('init-app')
      }
    }
  },

  async created () {
    this.db = await this.getDb()
    this.mess = await this.getMessFromDb()
    this.ready = true
    this.setProjectData()

    menuEventBus
      .$on('start-mess-db', () => this.addMess(false)) // false = mess is clean
      .$on('set-mess-db', () => this.addMess(true)) // true = mess is dirty
      .$on('wipe-mess-db', () => this.wipeMess())
  }
})

// BLOB DOWNLOAD HACK
console.save = function (data, filename) {
  if (!data) return console.error('no data to save?!')
  if (!filename) filename = 'console.json'
  if (typeof data === 'object') data = JSON.stringify(data, undefined, 4)
  var blob = new Blob([data], {type: 'text/json'})
  var e = document.createEvent('MouseEvents')
  var a = document.createElement('a')
  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}
