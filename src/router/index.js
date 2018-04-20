import Vue from 'vue'
import Router from 'vue-router'
import goods from '../components/goods/goods'
import seller from '../components/seller/seller'
import ratings from '../components/ratings/ratings'
import '../common/stylus/index.styl'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {path: '/', component: goods},
    {path: '/goods', component: goods},
    {path: '/ratings', component: ratings},
    {path: '/seller', component: seller}
  ]
})
