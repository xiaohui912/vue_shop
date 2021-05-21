<template>
  <el-container class="home_container">
    <!--    头部-->
    <el-header>
      <div>
        <h1 @click="goHome">后台管理系统</h1>
      </div>
      <el-button class="home_logout" @click="logout">退出</el-button>
    </el-header>
    <!--   主体-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu :collapse="isCollapse" :collapse-transition="false" active-text-color="#409EFF"
                 background-color="#333744" router text-color="#fff" unique-opened
                 :default-active="activePath">
          <!--          一级菜单-->
          <el-submenu v-for="menus in menuList" :key="menus.id" :index="menus.id+''">
            <template #title>
              <i class="el-icon-user"></i>
              <span>{{ menus.authName }}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item v-for="menu in menus.children" :key="menu.id" :index="'/'+menu.path" @click="SaveNavState('/'+menu.path)">
              <template #title>
                <i class="el-icon-menu"></i>
                <span>{{ menu.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--      右侧内容-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data () {
    return {
      menuList: [],
      isCollapse: false,
      activePath: localStorage.getItem('activePath') || ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      localStorage.clear()
      this.$router.push('/login')
    },
    goHome () {
      this.$router.push('/home')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await axios.get('/menus')
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.menuList = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    SaveNavState (activePath) {
      localStorage.setItem('activePath', activePath)
    }
  },
  mounted () {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
  .el-main {
    background-color: #EAEDF1;
    height: 100%;
  }
}

.el-header {
  background-color: #373d41;
  padding: 10px;

  h1 {
    cursor: pointer;
  }

  .home_logout {
    float: right;
  }

  div {
    height: 100%;
    display: flex;
    align-items: center;
    float: left;
    color: white;
  }
}

.el-aside {
  background-color: #333744;
  height: 100%;

  .el-menu {
    border: none;
  }
}

.toggle-button {
  background-color: #4A5064;
  text-align: center;
  color: white;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}

</style>
