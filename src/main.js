import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import Clipboard from 'v-clipboard'

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

Vue.use(Clipboard)