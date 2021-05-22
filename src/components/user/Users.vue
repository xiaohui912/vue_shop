<template>
  <div>
    <!--    链接路线-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <!--      搜索和添加-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--      用户列表-->
      <el-table :data="searchUserList" border stripe style="width: 100%">
        <el-table-column type="index">
        </el-table-column>
        <el-table-column label="名字" prop="username">
        </el-table-column>
        <el-table-column label="手机" prop="mobile">
        </el-table-column>
        <el-table-column label="邮箱" prop="email">
        </el-table-column>
        <el-table-column label="角色" prop="role_name" width="100px">
        </el-table-column>
        <el-table-column label="状态" width="60px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip :enterable="false" content="修改" effect="dark" placement="top">
              <el-button icon="el-icon-edit" size="mini" type="primary"
                         @click="showUpdateVisible(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" content="删除" effect="dark" placement="top">
              <template>
                <el-button icon="el-icon-delete" size="mini" type="danger" @click="delUser(scope.row.id)"></el-button>
              </template>
            </el-tooltip>
            <el-tooltip :enterable="false" content="分配角色" effect="dark" placement="top">
              <el-button icon="el-icon-setting" size="mini" type="warning" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页列表-->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[5, 10, 20, 30]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>
    <!--    添加用户对话框-->
    <el-dialog :visible.sync="addVisible" title="添加用户" width="50%" @close="resetAddUserList">
      <!--      内容主体区-->
      <el-form ref="ruleAddForm" :model="addUserList" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserList.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserList.password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserList.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserList.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改用户对话框-->
    <el-dialog :visible.sync="updateVisible" title="修改用户信息" width="50%" @close="resetUpdateUserList">
      <!--      内容主体区-->
      <el-form ref="ruleUpdateForm" :model="updateUserList" :rules="updateFormRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="updateUserList.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="updateUserList.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="updateUserList.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="updateVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--    分配角色对话框-->
    <el-dialog :visible.sync="setRoleVisible" title="分配角色" width="50%" @close="resetRoleList">
      <!--      内容主体区-->
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer">
        <el-button @click="setRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Users',
  data () {
    // 验证条件
    var emailRules = (rule, value, callback) => {
      var reg = /^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/
      if (value === '') {
        callback(new Error('请输入邮箱'))
      } else if (!reg.test(value)) {
        callback(new Error('邮箱格式不对'))
      } else if (reg.test(value)) {
        callback()
      }
    }
    return {
      // 获取用户数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 添加用户数据
      addVisible: false,
      addUserList: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 11,
            message: '长度为11位',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            validator: emailRules,
            trigger: 'blur'
          }
        ]
      },
      // 修改用户数据
      updateUserList: {},
      updateVisible: false,
      updateFormRules: {
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 11,
            message: '长度为11位',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            validator: emailRules,
            trigger: 'blur'
          }
        ]
      },
      setRoleVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  computed: {
    searchUserList () {
      return this.userList.filter(item => item.username.includes(this.queryInfo.query))
    }
  },
  methods: {
    // 获取数据方法
    async getUserList () {
      const { data: res } = await axios.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 修改管理员状态方法
    async userStateChanged (userinfo) {
      console.log(userinfo)
      const { data: res } = await axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('修改失败')
      }
      this.$message.success('修改成功')
    },
    // 添加用户方法
    // 对用户输入信息格式化
    resetAddUserList () {
      this.$refs.ruleAddForm.resetFields()
    },
    // 插入一个用户
    addUser () {
      this.$refs.ruleAddForm.validate(async valid => {
        if (!valid) return this.$message.error('请规范填写数据')
        const { data: res } = await axios.post('/users', this.addUserList)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addVisible = false
      })
    },
    // 修改用户方法
    // 初始化用户填写的数据
    resetUpdateUserList () {
      this.$refs.ruleUpdateForm.resetFields()
    },
    // 根据id获取当前用户信息
    async showUpdateVisible (id) {
      const { data: res } = await axios.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.updateUserList = res.data
      this.updateVisible = true
    },
    // 修改用户信息
    updateUser () {
      this.$refs.ruleUpdateForm.validate(async valid => {
        if (!valid) return this.$message.error('请规范填写数据')
        const { data: res } = await axios.put(`/users/${this.updateUserList.id}`, {
          email: this.updateUserList.email,
          mobile: this.updateUserList.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.updateVisible = false
        this.getUserList()
        this.$message.success('修改成功')
      })
    },
    // 根据id删除数据
    async delUser (id) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { data: res } = await axios.get(`users/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.getUserList()
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    // 分配角色方法
    async setRole (userInfo) {
      this.userInfo = userInfo
      const { data: res } = await axios.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
      this.setRoleVisible = true
    },
    async updateRole () {
      if (!this.selectedRoleId) return this.$message.error('请选择分配角色')
      const { data: res } = await axios.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败')
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleVisible = false
    },
    resetRoleList () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

.el-card {
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
}

.el-pagination {
  margin-top: 15px;
  text-align: center;
}

p {
  margin-bottom: 15px;
}
</style>
