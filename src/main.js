import { createApp } from 'vue'
import { createStore } from 'vuex'
import mitt from 'mitt'
import App from './App.vue'
import router from './router'

const DB_NAME = 'see-a-mess-db'
const DB_VERSION = 1
const DB_STORE_NAME = 'mess'

const HeaderTemplate =
`<div class="row unstyled">
  <div class="column unstyled">
    <h1>Remove me and add header content!</h1>
  </div>
</div>`
export function buildPageTemplate (pageId = 'home') {
  return `<section id="${pageId}" class="page unstyled">
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
}
const MainTemplate = buildPageTemplate('home')
const FooterTemplate =
`<div class="row unstyled">
  <div class="column unstyled col-3">
    <h3>Remove me and add footer content!</h3>
  </div>
  <div class="column unstyled col-3"></div>
  <div class="column unstyled col-3"></div>
</div>`

const emitter = mitt()
export const menuEventBus = {
  $on (eventName, handler) {
    emitter.on(eventName, handler)
    return this
  },
  $off (eventName, handler) {
    emitter.off(eventName, handler)
    return this
  },
  $emit (eventName, payload) {
    emitter.emit(eventName, payload)
    return this
  }
}

export const store = createStore({
  state: {
    name: null,
    header: HeaderTemplate,
    main: MainTemplate,
    footer: FooterTemplate,
    js: {},
    css: {
      images: [],
      fonts: [],
      stylesheets: [],
      breakpoints: [640, 960]
    },
    html_location: {}
  },
  mutations: {
    updateName (state, newVal) {
      state.name = newVal
    },
    updateHeader (state, newVal) {
      state.header = newVal
    },
    updateMain (state, newVal) {
      state.main = newVal
    },
    updateFooter (state, newVal) {
      state.footer = newVal
    },
    updateJs (state, newVal) {
      state.js = newVal
    },
    updateCss (state, newVal) {
      state.css = newVal
    },
    updateImages (state, newVal) {
      state.css['images'] = newVal
    },
    updateLocation (state, newVal) {
      state.html_location = newVal
    }
  },
  actions: {
    updateTheImages (context, newVal) {
      context.commit('updateImages', newVal)
    },
    updateTheLocation (context, newVal) {
      context.commit('updateLocation', newVal)
    }
  }
})

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

let db = null
let mess = []

async function getDb () {
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
      let currentDb = e.target.result
      currentDb.createObjectStore(DB_STORE_NAME)
    }
  })
}

async function getMessFromDb () {
  return new Promise((resolve, reject) => {
    let tr = db.transaction([DB_STORE_NAME], 'readonly')
    tr.oncomplete = e => resolve(mess)
    let objectStore = tr.objectStore(DB_STORE_NAME)
    let data = []
    objectStore.openCursor().onsuccess = e => {
      let cursor = e.target.result
      if (cursor) {
        data.push(cursor.value)
        cursor.continue()
      }
    }
    tr.onerror = reject
    tr.oncomplete = () => resolve(data)
  })
}

async function addMessDB (newMess) {
  return new Promise((resolve, reject) => {
    let tr = db.transaction([DB_STORE_NAME], 'readwrite')
    tr.oncomplete = e => resolve()
    tr.onerror = reject
    let objectStore = tr.objectStore(DB_STORE_NAME)
    objectStore.add(newMess, 0)
    console.log('new mess db added')
    menuEventBus.$emit('refresh-mess-maker', 'import')
  })
}

async function updateDB (newMess) {
  return new Promise((resolve, reject) => {
    let objectStore = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME)
    let request = objectStore.get(0)
    request.onerror = e => {
      console.log('error requesting mess db update:' + e.target.error)
      reject(e.target.error)
    }
    request.onsuccess = e => {
      let data = e.target.result
      data = newMess
      let requestUpdate = objectStore.put(data, 0)
      requestUpdate.onerror = e => {
        console.log('error updating mess db:' + e.target.error)
        reject(e.target.error)
      }
      requestUpdate.onsuccess = () => {
        console.log('mess db updated')
        resolve()
      }
    }
  })
}

async function addMess (dirty = true) {
  if (dirty) console.log('update mess: data store -> mess db')
  else console.log('add mess: data store -> mess db')
  let newMess = JSON.parse(JSON.stringify({
    name: store.state.name,
    header: store.state.header,
    main: store.state.main,
    footer: store.state.footer,
    js: store.state.js,
    css: store.state.css
  }))
  if (dirty) await updateDB(newMess)
  else await addMessDB(newMess)
  mess = await getMessFromDb()
}

async function wipeMess () {
  mess = []
  store.state.name = null
  store.state.header = HeaderTemplate
  store.state.main = MainTemplate
  store.state.footer = FooterTemplate
  store.state.js = []
  store.state.css = { images: [], fonts: [], stylesheets: [] }
  let objectStore = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME)
  let req = objectStore.clear()
  req.onsuccess = e => {
    console.log('mess db store removed')
    menuEventBus.$emit('close-menu')
    menuEventBus.$emit('new-mess')
  }
  req.onerror = e => console.error('clearObjectStore:', e.target.errorCode)
}

function setProjectData () {
  if (mess[0] !== undefined) {
    store.commit('updateName', mess[0].name)
    store.commit('updateHeader', mess[0].header)
    store.commit('updateMain', mess[0].main)
    store.commit('updateFooter', mess[0].footer)
    store.commit('updateJs', mess[0].js)
    store.commit('updateCss', mess[0].css)
    console.log('found a mess = mess db -> data store')
  }
  menuEventBus.$emit('init-app')
}

async function bootstrapDb () {
  db = await getDb()
  mess = await getMessFromDb()
  setProjectData()

  menuEventBus
    .$on('start-mess-db', () => addMess(false))
    .$on('set-mess-db', () => addMess(true))
    .$on('wipe-mess-db', () => wipeMess())
}

bootstrapDb()

// SUPER SIMPLE BLOB DOWNLOAD
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
