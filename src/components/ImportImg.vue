<template>
  <form>

    <h1>IMAGE LIBRARY</h1>
    <ul>
      <li v-for="img in imageList" :key="img.name">
        <div @click="addImage(img.name,img.file)" :style="{ backgroundImage: 'url(data:image/png;base64,' + img.file + ')' }"></div>
        {{ img.name }}
      </li>
    </ul>

    <div v-if=" targetAcquired "><img id="imgElement" src="" /></div>
    <input name="imageInput" type="file" @change="onFileChange" accept="image/png, image/jpeg" />
    <br />

    <button type="button" @click="saveImage">Add to Library</button>
    <button type="button" @click="clearImage">Cancel</button>

  </form>
</template>

<script>

import { menuEventBus } from '../main.js'

export default {
  name: 'ImportImage',
  data () {
    return {
      targetAcquired: false,
      imageData: null,
      imageList: [],
      selectedImage: null
    }
  },
  computed: {
    imgSrc (data) {
      return 'data:image/png;base64,' + data
    }
  },
  methods: {

    onFileChange (e) {
      let input = e.target
      if (input.files && input.files[0]) {
        if (input.files[0].size > 750000) {
          alert('Whoa! This image is HUGE for the web! Try optimizing it first...')
          this.clearImage()
          return false
        } else {
          this.targetAcquired = true
          let reader = new FileReader()
          reader.onload = (img) => { document.getElementById('imgElement').src = img.target.result }
          reader.readAsDataURL(input.files[0])
        }
      }
    },

    getBase64Image () {
      let img = document.getElementById('imgElement')
      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      let dataURL = canvas.toDataURL('image/png')
      this.imageData = dataURL.replace(/^data:image\/(png|jpg);base64,/, '')
    },

    saveImage () {
      this.getBase64Image()
      let imgName = prompt('Please enter an image name')
      if (imgName !== null) {
        let saveImage = {
          name: imgName,
          file: this.imageData
        }
        if (this.imageList.length) {
          if (!this.imageList.includes(saveImage)) {
            this.imageList.push(saveImage)
            this.$store.dispatch('updateTheImages', this.imageList.slice())
          }
        } else {
          this.imageList.push(saveImage)
          this.$store.dispatch('updateTheImages', this.imageList.slice())
        }
        menuEventBus.$emit('set-mess-db')
        this.clearImage()
      }
    },

    clearImage () {
      this.imageData = null
      document.getElementsByName('imageInput')[0].value = ''
      if (document.getElementById('imgElement').src) document.getElementById('imgElement').src = ''
      this.targetAcquired = false
    },

    addImage (name, file) {
      if (name && file) {
        let addImage = {
          name: name,
          file: file
        }
        menuEventBus.$emit('add-image', addImage)
      }
    },

    updateImages () {
      this.imageList = this.$store.state.css.images
    }

  },
  created () {
    if (this.$store.state.css.images && this.$store.state.css.images.length > 0) this.updateImages()
  }
}

</script>

<style lang="scss" scoped>

form {
  width: 90vw;

  ul {
    height: 40vmin;
    padding: 1vw;
    margin-bottom: 1vw;
    display: flex;
    flex-wrap: wrap;
    overflow-x: hidden;
    overflow-y: auto;
    list-style: none;
    box-shadow: inset 0 0 5vw rgba(#41B883,0.75);

    li {
      width: 11.5vw;
      height: 14vw;
      padding: 1vw 0.66vw;
      border: 1px solid white;
      margin: 0.5vmin;
      background: rgba(255,255,255,0.1);
      line-height: 3vw;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      div {
        margin: 0;
      }
    }
  }

  div {
    width: 10vw;
    height: 10vw;
    margin: 0 auto 20px;
    position: relative;
    background-size: cover;
    background-position: center top;
    overflow: hidden;

    img {
      max-width: 1200px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }

    &:hover {
      overflow: visible;
    }
  }
}

</style>
