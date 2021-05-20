import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login/Login'
import Home from '../components/Home/Home'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home
    }
  ]
})
// 挂载路由守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径  from代表从哪个路径过来   next是个函数，不传参代表放行和传参代表重定向
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
