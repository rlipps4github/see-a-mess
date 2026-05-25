import { createRouter, createWebHistory } from 'vue-router'
import MessBuilder from '@/components/MessBuilder.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'MessBuilder',
      component: MessBuilder
    }
  ]
})
