// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

export const menuEventBus = new Vue()
export const projectDataBus = new Vue({
  data: {
    name: '',
    page_location: '',
    html_location: {},
    header: {},
    main: {},
    footer: {},
    js: '',
    css: ''
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
    showMenu: false
  }
})

/* eslint-disable no-new */
console.save = function (data, filename) {
  // EXPORT FILE DOWNLOAD HACK
  if (!data) return console.error('Console.save: No data')
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
