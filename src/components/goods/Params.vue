<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告提示信息 -->
      <el-alert
        title="只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="paramsKey"
            :options="cateList"
            :props="cascaderProps"
            @change="paramsChanged"
          ></el-cascader>
          <!-- 标签页<动态参数,静态属性> -->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <!-- 添加动态参数的面板 -->
            <el-tab-pane label="动态参数" name="many">
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="showDialog"
                >添加参数</el-button
              >
              <!-- 动态参数表格 -->
              <el-table :data="manyTableDate" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item, i) in scope.row.attr_vals"
                      :key="i"
                      closable
                      @close="handleClose(i, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                      >+ New Tag</el-button
                    >
                  </template>
                </el-table-column>
                <!-- 序号列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column
                  label="参数名称"
                  prop="attr_name"
                ></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      @click="showEditDialog(scope.row.attr_id)"
                      >修改</el-button
                    >
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="deleteTableDate(scope.row.attr_id)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性的面板 -->
            <el-tab-pane label="静态属性" name="only">
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="showDialog"
                >添加属性</el-button
              >
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
               <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item, i) in scope.row.attr_vals"
                      :key="i"
                      closable
                      @close="handleClose(i, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                      >+ New Tag</el-button
                    >
                  </template>
                </el-table-column>
                <!-- 序号列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column
                  label="属性名称"
                  prop="attr_name"
                ></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      @click="showEditDialog(scope.row.attr_id)"
                      >修改</el-button
                    >
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="deleteTableDate(scope.row.attr_id)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <!-- 添加动态参数,静态属性的对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 主体内容 -->
        <el-form
          :model="addFrom"
          :rules="addFromRules"
          ref="addFromRef"
          label-width="100px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addFrom.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 脚部 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改动态参数,静态属性的对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 主体内容 -->
        <el-form
          :model="editFrom"
          :rules="editFromRules"
          ref="editFromRef"
          label-width="100px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editFrom.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 脚部 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams(editFrom.attr_id)"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类
      cateList: [],
      // 选中后绑定的数据
      paramsKey: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      //   默认显示第一个标签页
      activeName: "many",
      //   动态参数表格的数据
      manyTableDate: [],
      // 静态参数表格的数据
      onlyTableData: [],
      //   监听添加动态参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加动态参数表单内容
      addFrom: {
        attr_name: ""
      },
      // 添加动态参数表单的验证规则
      addFromRules: {
        attr_name: {
          required: true,
          message: "请输入动态参数",
          trigger: "blur"
        }
      },
      //   监听修改表单的显示与隐藏
      editDialogVisible: false,
      //   修改表单内容
      editFrom: {
        attr_name: ""
      },
      //   修改表单的验证规则
      editFromRules: {
        attr_name: {
          required: true,
          message: "请输入动态参数",
          trigger: "blur"
        }
      }
    };
  },
  created() {
    this.getParams();
  },
  methods: {
    //   获取所有的商品分类
    async getParams() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data;
    },
    // 选择器选中的参数
    paramsChanged() {
      this.getParamsDate();
    },
    // 标签页点击事件
    handleTabClick() {
      //   console.log(this.activeName);
      this.getParamsDate();
    },
    // 获取参数的列表数据
    async getParamsDate() {
      if (this.paramsKey.length !== 3) {
        this.paramsKey = [];
        this.manyTableDate = [];
        this.onlyTableData = [];
        return;
      }
      //   根据所选类的id 和所处的面板 获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取列表失败");
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //   控制按钮与文本框的切换显示
        (item.inputVisible = false),
          // 文本框输入的内容
          (item.inputValue = "");
      });
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableDate = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 点击按钮，显示添加参数对话框
    showDialog() {
      this.addDialogVisible = true;
    },
    // 添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFromRef.resetFields();
    },
    // 点击按钮 提交添加对话框的参数
    addParams() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateID}/attributes`,
          {
            attr_name: this.addFrom.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("新增" + this.titleText + "失败");
        }
        this.$message.success("新增" + this.titleText + "成功");
        this.getParamsDate();
        this.addDialogVisible = false;
      });
    },
    // 点击按钮，显示修改的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("查询" + this.titleText + "数据失败");
      }
      this.editFrom = res.data;

      this.editDialogVisible = true;
    },
    // 修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFromRef.resetFields();
    },
    // 点击按钮， 提交修改对话框的参数
    editParams(id) {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateID}/attributes/${id}`,
          {
            attr_name: this.editFrom.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改" + this.titleText + "数据失败");
        }
        this.$message.success("修改" + this.titleText + "数据成功");
        this.getParamsDate();
        this.editDialogVisible = false;
      });
    },
    // 点击按钮删除选项
    async deleteTableDate(id) {
      const result = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(result);
      if (result !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateID}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }

      this.$message.success("删除成功！");
      this.getParamsDate();
    },
    // 文本框失去焦点，或者摁下enter键触发的事件
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttr(row);
    },
    // 点击按钮显示文本框
    showInput(val) {
      val.inputVisible = true;
      //   让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 保存数据操作
    async saveAttr(row) {
      //   保存这次添加
      const { data: res } = await this.$http.put(
        `categories/${this.cateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数失败");
      }
      this.$message.success("修改参数成功");
    },
    // 点击删除tag
    handleClose(id, row) {
      row.attr_vals.splice(id, 1);
      this.saveAttr(row);
    }
  },
  computed: {
    //   如果按钮需要被禁用，则返回true 否则返回 false
    isBtnDisabled() {
      if (this.paramsKey.length !== 3) {
        return true;
      }
      return false;
    },
    //   当前选中的三级ID
    cateID() {
      if (this.paramsKey.length === 3) {
        return this.paramsKey[2];
      }
      return null;
    },
    // 动态计算标题的文字
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
  font-size: 18px;
}
.el-cascader {
  padding-left: 20px;
}
.el-tabs {
  margin-top: 15px;
}
.el-tag,
.el-button,
.el-input {
  margin-left: 10px;
}
.el-input {
  width: 100px;
}
</style>
