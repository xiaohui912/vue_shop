import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Roles from '../components/power/Roles'
import Rights from '../components/power/Rights'
import Goods from '../components/Goods/Goods'
import Params from '../components/Goods/Params'
import Categories from '../components/Goods/Categories'
import Orders from '../components/Orders/Orders'
import Reports from '../components/Reports/Reports'

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
      component: Home,
      children: [
        {
          path: '/home',
          redirect: '/welcome'
        },
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/goods',
          component: Goods
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/categories',
          component: Categories
        },
        {
          path: '/orders',
          component: Orders
        },
        {
          path: '/reports',
          component: Reports
        }
      ]
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
