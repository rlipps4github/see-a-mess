<template>
  <form>
    <input type="file" @change="onFileChange" accept=".mess" />
    <br />
    <button type="button" @click="submitFileList" :disabled="messFileList === null">Import</button>
  </form>
</template>

<script>
import { menuEventBus, projectDataBus } from '../main'

export default {
  name: 'ImportForm',
  data () {
    return {
      messFileList: null,
      projectName: null,
      projectHeader: null,
      projectMain: null,
      projectFooter: null,
      projectJs: null,
      projectCss: null
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
            vm.projectName = theMess.name
            vm.projectHeader = theMess.header
            vm.projectMain = theMess.main
            vm.projectFooter = theMess.footer
            vm.projectJs = theMess.js
            vm.projectCss = theMess.css
          }
          file.onloadend = () => {
            menuEventBus.$emit('set-mess-db')
            menuEventBus.$emit('refresh-mess-maker', 'import')
            menuEventBus.$emit('close-menu')
            menuEventBus.$emit('show-mess')
          }
          file.readAsText(files[0])
        } catch (error) {
          alert('mess import failed \r\n' + error)
        }
      }
    }
  },
  watch: {
    projectName (newProjectName) {
      projectDataBus.name = newProjectName
    },
    projectHeader (newProjectHeader) {
      projectDataBus.header = newProjectHeader
    },
    projectMain (newProjectMain) {
      projectDataBus.main = newProjectMain
    },
    projectFooter (newProjectFooter) {
      projectDataBus.footer = newProjectFooter
    },
    projectJs (newProjectJs) {
      projectDataBus.js = newProjectJs
    },
    projectCss (newProjectCss) {
      projectDataBus.css = newProjectCss
    }
  }
}

</script>
