<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRight">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" width="60px">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'venter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop', 'venter']"
                >
                  <!-- 渲染的二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                    >
                      {{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染的三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 序号列 -->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="340px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editSetRightDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogclosed"
    >
      <!-- 内容主体区域 -->
      <el-tree
        :data="rightslist"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        :props="treeProps"
        ref="treeRef"
      >
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 增加角色对话框 -->
    <el-dialog
      title="增加角色"
      :visible.sync="addRightDialogVisible"
      width="50%"
      @close="addRightClosed"
    >
      <el-form
        :model="addRightFrom"
        :rules="addFormRules"
        ref="addRightFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称">
          <el-input v-model="addRightFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRightFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddRightFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editRolesDialogClosed"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="saveRolesEditForm(editRolesForm.roleId)"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      //   所有权限数据
      rightslist: [],
      //   控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //    控制增加角色对话框的显示与隐藏
      addRightDialogVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      //  查询到的用户信息对象
      editForm: {},
      //   树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的id值数组
      defKeys: [],
      // 即将分配权限的角色id
      roleId: "",
      // 增加角色列表
      addRightFrom: {
        roleName: "",
        roleDesc: ""
      },
      // 编辑列表
      editRolesForm: {},
      // 增加角色验证规则
      addFormRules: {
        roleName: {
          required: true,
          message: "请输入角色名称",
          trigger: "blur"
        },
        roleDesc: {
          required: true,
          message: "请输入角色描述",
          trigger: "blur"
        }
      },
      // 编辑角色验证规则
      editRolesFormRules: {
        roleName: {
          required: true,
          message: "请输入角色名称",
          trigger: "blur"
        },
        roleDesc: {
          required: true,
          message: "请输入角色描述",
          trigger: "blur"
        }
      }
    };
  },
  created() {
    this.getrolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getrolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("角色列表获取失败 ！");
      }

      this.rolesList = res.data;
      //   console.log(this.rolesList);
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败 !");
      }
      role.children = res.data;
    },
    //   展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightslist = res.data;
      console.log(this.rightslist);
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 递归函数，获取所有角色三级权限下的id，并保存到defKeys中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    //   监听分配权限对话框的关闭事件
    setRightDialogclosed() {
      this.defKeys = [];
    },
    // 给角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      const isStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: isStr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("角色分配权限失败");
      }
      this.$message.success("角色分配权限成功");

      this.getrolesList();
      this.setRightDialogVisible = false;
    },
    // 增加角色对话框
    addRight() {
      this.addRightDialogVisible = true;
    },
    // 监听增加角色对话框的关闭事件
    addRightClosed() {
      this.$refs.addRightFormRef.resetFields();
    },
    // 提交添加角色表单
    saveAddRightFrom() {
      this.$refs.addRightFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post("roles", this.addRightFrom);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功");
        this.addRightDialogVisible = false;
        this.getrolesList();
        this.addRightFrom = {}
      });
    },
    // 编辑角色
    async editSetRightDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查询角色数据失败 ！");
      }

      this.editRolesForm = res.data;
    },

    // 监听编辑角色的对话框
    editRolesDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },

    // 保存编辑角色提交
    saveRolesEditForm(id) {
      console.log(id, "========" + this.editRolesForm);
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + id,
          this.editRolesForm
        );

        if (res.meta.status !== 200) {
          return this.$message.error("编辑角色失败 ！");
        }

        this.$message.success("编辑角色成功 ！");

        this.editDialogVisible = false;
        this.getrolesList();
      });
    },
    // 删除角色
    async deleteRolesById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //  confirmResult  点击确定按钮 结果为字符串confirm
      //  confirmResult  点击取消按钮 结果为字符串cancel
      // console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
     if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }

      this.$message.success("删除角色成功 ！");
      this.getrolesList();
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>
