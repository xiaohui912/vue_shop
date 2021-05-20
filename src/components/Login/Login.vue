<template>
  <div class="login_container">
    <div class="login_box">
      <div class="portrait_box">
        <!--头像区-->
        <img alt="#" src="../../assets/1.jpg">
      </div>
      <!--登陆表-->
      <el-form ref="login_form_ref" :model="form" :rules="rules" class="login_form" label-width="0px">
        <el-form-item prop="username">
          <!--          用户名-->
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <!--          密码-->
          <el-input v-model="form.password" placeholder="请输入密码" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <!--          按钮-->
          <el-button type="primary" @click="verify">登陆</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  methods: {
    reset () {
      this.$refs.login_form_ref.resetFields()
    },
    verify () {
      this.$refs.login_form_ref.validate(async (valid) => {
        if (!valid) {
          this.$message.error('用户名或密码不合法')
        } else {
          const { data: res } = await axios.post('login', this.form)
          if (res.meta.status !== 200) return this.$message.error('登陆失败')
          this.$message.success('登陆成功')
          window.sessionStorage.setItem('token', res.data.token)
          await this.$router.push('/home')
        }
      })
    }
  },
  data () {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
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
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b4b6b;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: white;
    border-radius: 3px;
    position: relative;

    .portrait_box {
      height: 130px;
      width: 130px;
      position: absolute;
      top: calc(-130px / 2);
      left: calc(50% - 130px / 2);
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 5px;
      box-shadow: 0 0 10px #ddd;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }
}

.btns {
  text-align: center;
}

.login_form {
  padding: 20px;
  margin-top: 80px;
}
</style>
