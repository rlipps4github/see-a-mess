<template>
  <form class="import-form">
    <input type="file" @change="onFileChange" />
    <button type="button" @click="submitFileList">Import</button>
  </form>
</template>

<script>
import { menuEventBus, projectDataBus } from '../main'

export default {
  name: 'ImportForm',
  data () {
    return {
      messFileList: null
    }
  },
  methods: {

    onFileChange (e) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      this.messFileList = files
    },

    hashMess (content, passcode = 'see-a-mess') {
      var result = []
      var passLen = passcode.length
      for (var i = 0; i < content.length; i++) {
        var passOffset = i % passLen
        var calAscii = (content.charCodeAt(i) + passcode.charCodeAt(passOffset))
        result.push(calAscii)
      }
      return JSON.stringify(result)
    },

    dehashMess (content, passcode = 'see-a-mess') {
      var result = []
      var str = ''
      var codesArr = JSON.parse(content)
      var passLen = passcode.length
      for (var a = 0; a < codesArr.length; a++) {
        var passOffset = a % passLen
        var calAscii = (codesArr[a] - passcode.charCodeAt(passOffset))
        result.push(calAscii)
      }
      for (var b = 0; b < result.length; b++) {
        var ch = String.fromCharCode(result[b]); str += ch
      }
      return str
    },

    submitFileList () {
      var ruSure = confirm('Are you sure? \r\n This will erase any unsaved \r\n project data...')
      if (ruSure === true) {
        let vm = this
        let file = new FileReader()
        let files = this.messFileList
        try {
          file.onload = () => {
            let theMess = JSON.parse(vm.dehashMess(file.result))
            localStorage.name = theMess.name
            localStorage.header = theMess.header
            localStorage.main = theMess.main
            localStorage.footer = theMess.footer
            localStorage.js = theMess.js
            localStorage.css = theMess.css
            localStorage.mess = theMess.mess
            projectDataBus.name = theMess.name
            projectDataBus.header = theMess.header
            projectDataBus.main = theMess.main
            projectDataBus.footer = theMess.footer
            projectDataBus.js = theMess.js
            projectDataBus.css = theMess.css
            projectDataBus.mess = theMess.mess
            menuEventBus.$emit('import-mess')
            menuEventBus.$emit('menu-closed')
          }
          file.readAsText(files[0])
        } catch (error) {
          alert('Import failed \r\n' + error)
        }
      }
    }

  }
}
</script>
