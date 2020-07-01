<template>
  <form>
    <ul>
      <li v-for="img in imageList" :key="img.name">
        <div @click="addImage(img.name,img.file)" :style="{ backgroundImage: 'url(data:image/png;base64,' + img.file + ')' }"></div>
        {{ img.name }}
      </li>
    </ul>

    <div><img id="imgElement" src="" /></div>
    <input type="file" @change="onFileChange" accept="image/png, image/jpeg" />
    <br />
    <button type="button" @click="saveImage">Import Image</button>
  </form>
</template>

<script>

import { menuEventBus, projectDataBus } from '../main'

export default {
  name: 'ImportImage',
  data () {
    return {
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
        let reader = new FileReader()
        reader.onload = (e) => { document.getElementById('imgElement').src = e.target.result }
        reader.readAsDataURL(input.files[0])
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
          if (!this.imageList.includes(saveImage)) this.imageList.push(saveImage)
          projectDataBus.css.images = this.imageList.slice()
        } else {
          this.imageList.push(saveImage)
          projectDataBus.css.images = this.imageList.slice()
        }
        menuEventBus.$emit('add-image', saveImage)
        menuEventBus.$emit('set-mess-db')
      }
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
      this.imageList = projectDataBus.css.images
    }

  },
  created () {
    if (projectDataBus.css.images && projectDataBus.css.images.length > 0) this.updateImages()
  }
}

</script>

<style lang="scss" scoped>

form {
  width: 90vw;

  ul {
    height: 40vmin;
    display: flex;
    flex-wrap: wrap;
    overflow-x: hidden;
    overflow-y: auto;
    list-style: none;

    li {
      height: 14vw;
      padding: 1vw;
      border: 1px solid rgba(0,0,0,0.8);
      margin: 0.5vmin;
      background: rgba(0,0,0,0.1);
      line-height: 3vw;
    }
  }

  div {
    width: 10vw;
    height: 10vw;
    position: relative;
    background-size: cover;
    background-position: center top;
    overflow: hidden;

    img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }
  }
}

</style>>
