import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式表
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器的插件
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 倒入进度条的包对应的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'


import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截
// 在request拦截器重，展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  Nprogress.start()
  //为请求头对象，添加Token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器重，展示进度条 Nprogress.done()
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})

//  $http 就在所有Vue实例中可用了，甚至在实例被创建之前就可以用。
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


