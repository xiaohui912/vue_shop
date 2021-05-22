<template>
  <div>
    <!--    链接路线-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addVisible = true">角色添加</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id"
                    :class="['bdbottom',index1===0?'bdtop':'','vcenter']">
              <el-col :span="5">
                <el-tag closable @close="idDelTag(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2,index2) in item1.children" :key="item2.id"
                        :class="['vcenter',index2===0?'':'bdtop']">
                  <el-col :span="5">
                    <el-tag closable type="success" @close="idDelTag(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-row>
                      <el-col>
                        <el-tag v-for="(item3) in item2.children" :key="item3.id" closable type="warning"
                                @close="idDelTag(scope.row,item3.id)">{{ item3.authName }}
                        </el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column :width="290" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="idGetRole(scope.row.id)">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="idDelRole(scope.row.id)">删除</el-button>
            <el-button icon="el-icon-setting" size="mini" type="warning" @click="showRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--    添加角色对话框-->
    <el-dialog :visible.sync="addVisible" title="角色添加" width="50%" @close="resetAddRoleList">
      <!--      内容主体区-->
      <el-form ref="addRoleForm" :model="addRoleList" :rules="addFormRules" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改角色对话框-->
    <el-dialog :visible.sync="updateVisible" title="角色修改" width="50%" @close="resetUpdateRoleList">
      <!--      内容主体区-->
      <el-form ref="updateRoleForm" :model="updateRoleList" :rules="updateFormRules" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="updateRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="updateRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="updateVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--    分配权限对话框-->
    <el-dialog :visible.sync="rightVisible" title="权限分配" width="50%" @close="resetDefKeys">
      <!--      内容主体区-->
      <el-tree ref="treeFef" :data="rightList" :default-checked-keys="defKeys" :props="rightProps" default-expand-all
               node-key="id" show-checkbox></el-tree>
      <span slot="footer">
        <el-button @click="rightVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [],
      // 添加角色数据
      addVisible: false,
      addRoleList: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: {
          required: true,
          message: '请输入角色名',
          trigger: 'blur'
        },
        roleDesc: {
          message: '请输入角色描述',
          trigger: 'blur'
        }
      },
      // 修改角色数据
      updateVisible: false,
      updateRoleList: {},
      updateFormRules: {
        roleName: {
          required: true,
          message: '请输入角色名',
          trigger: 'blur'
        },
        roleDesc: {
          message: '请输入角色描述',
          trigger: 'blur'
        }
      },
      // 权限分配数据
      rightVisible: false,
      rightList: [],
      rightProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      rightId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色方法
    async getRoleList () {
      const { data: res } = await axios.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.rolesList = res.data
    },
    // 添加角色方法
    resetAddRoleList () {
      this.$refs.addRoleForm.resetFields()
    },
    async addRole () {
      const { data: res } = await axios.post('/roles', this.addRoleList)
      if (res.meta.status !== 201) return this.$message.error('角色添加失败')
      this.getRoleList()
      this.addVisible = false
      this.$message.success('角色添加成功')
    },
    // 修改角色方法
    resetUpdateRoleList () {
      this.$refs.updateRoleForm.resetFields()
    },
    async idGetRole (id) {
      this.updateVisible = true
      const { data: res } = await axios.get(`/roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取角色失败')
      this.updateRoleList = res.data
      console.log(res.data)
      this.$message.success('角色获取成功')
    },
    async updateRole () {
      const { data: res } = await axios.put(`/roles/${this.updateRoleList.roleId}`, this.updateRoleList)
      if (res.meta.status !== 200) return this.$message.error('角色修改失败')
      this.getRoleList()
      this.updateVisible = false
      this.$message.success('角色修改成功')
    },
    // 删除角色
    async idDelRole (id) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { data: res } = await axios.delete(`roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.getRoleList()
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('取消删除')
      }
    },
    async idDelTag (role, rightId) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { data: res } = await axios.delete(`/roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        role.children = res.data
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('取消删除')
      }
    },
    // 权限分配方法
    async showRightDialog (role) {
      this.rightId = role.id
      const { data: res } = await axios.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.rightList = res.data
      this.getDefKeys(role, this.defKeys)
      this.rightVisible = true
    },
    // 通过递归获取id中原本已有的选中项
    getDefKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getDefKeys(item, arr))
    },
    // 关闭后格式化数组
    resetDefKeys () {
      this.defKeys = []
    },
    // 点击确定后将打勾的树叶发送
    async updateRights () {
      const keys = [
        ...this.$refs.treeFef.getCheckedKeys(),
        ...this.$refs.treeFef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await axios.post(`roles/${this.rightId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('更新失败')
      this.getRoleList()
      this.rightVisible = false
      this.$message.success('更新成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.bdtop {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
