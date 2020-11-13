<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <!-- 修改编辑按钮 -->
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-row>
              <!-- 编辑按钮 -->
              <el-tooltip
                effect="dark"
                content="编辑"
                placement="top-start"
                :enterable="false"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.id)"
                ></el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-tooltip
                effect="dark"
                content="删除"
                placement="top-start"
                :enterable="false"
              >
                <template>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeUserById(scope.row.id)"
                  ></el-button>
                </template>
              </el-tooltip>
              <!-- 分配角色按钮 -->
              <el-tooltip
                effect="dark"
                content="分配角色"
                placement="top-start"
                :enterable="false"
              >
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="setRole(scope.row)"
                ></el-button>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo(editForm.id)">
          确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      :v-model="setRoleData"
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户: {{ setRoleData.username }}</p>
        <p>当前的角色：{{ setRoleData.role_name }}</p>
      </div>
      <div>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }
      // 不合法的邮箱
      cb(new Error("请输入合法的邮箱"));
    };
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMoblie = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMoblie.test(value)) {
        // 合法手机号
        return cb();
      }
      // 不合法手机号
      cb(new Error("请输入合法的手机号"));
    };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //   控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //    控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 控制角色分配对话框的显示与隐藏
      setRoleDialogVisible: false,
     
      // 添加用户表单的数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          },
          {
            min: 3,
            max: 12,
            message: "用户名的长度在3-12个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          },
          {
            min: 6,
            max: 13,
            message: "密码的长度在6 到 15个字符",
            trigger: "blur"
          }
        ],
        email: [
          {
            required: true,
            message: "请输入邮箱",
            trigger: "blur"
          },
          {
            validator: checkEmail,
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机号",
            trigger: "blur"
          },
          {
            validator: checkMobile,
            trigger: "blur"
          }
        ]
      },
      //  查询到的用户信息对象
      editForm: {},
      //   编辑表单的验证规则
      editFormRules: {
        email: [
          {
            required: true,
            message: "请输入邮箱",
            trigger: "blur"
          },
          {
            validator: checkEmail,
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机号",
            trigger: "blur"
          },
          {
            validator: checkMobile,
            trigger: "blur"
          }
        ]
      },
      // 分配角色表单数据
      setRoleData: {},
      // 角色列表
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: "",
      
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize 改变的事件 每页显示的条数
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getUserList();
    },
    // 监听 页码值改变的事件 当前页码数
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getUserList();
    },
    // 监听 switch状态按钮
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      return this.$message.success("更新用户状态成功！");
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("用户添加失败");
        }
        this.$message.success("用户添加成功");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("数据查询失败！");
      }
      this.editForm = res.data;
    },
    // 监听编辑用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo(id) {
      //  this.$refs.editFormRef.validate(async valid =>{} valid = ture预校验成功
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          "users/" + id,
          this.editForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error("用户更新失败");
        }
        this.$message.success("用户更新成功");
        //    隐藏修改用户的对话框
        this.editDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    // 删除按钮提示框
    async removeUserById(id) {
      // 弹框询问是否删除用户
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //  confirmResult  点击确定按钮 结果为字符串confirm
      //  confirmResult  点击取消按钮 结果为字符串cancel

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    // 展示角色分配对话框
    async setRole(val) {
      this.setRoleData = val;
      console.log(this.setRoleData);
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }

      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 保存修改结果
    async saveRoleInfo() {
      
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.setRoleData.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      console.log(res);

       if (res.meta.status !== 200)  {
        return this.$message.error("设置角色失败 !");
      }

      this.$message.success('更新角色成功！')
      // 隐藏分配角色对话框
      this.setRoleDialogVisible = false;

      // 重新获取用户列表数据
      this.getUserList();
    },

    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId="",
      this.setRoleData={}
    }
  }
};
</script>

<style lang="less" scoped></style>
