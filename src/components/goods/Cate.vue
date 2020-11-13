<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddCatedialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品分类列表 -->
      <tree-table
        :data="cateFrom"
        :columns="columns"
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 判断是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
            class="el-icon-success"
          ></i>
          <i v-else style="color:red" class="el-icon-error"></i>
        </template>
        <!-- 排序列 -->
        <template slot="link" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
            >二级</el-tag
          >
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row)"
            >修改</el-button
          >
          <!-- 删除按钮 -->
          <el-button size="mini" type="danger" icon="el-icon-delete"
          @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
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
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCatedialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <!-- 主体内容区域 -->
        <el-form
          :model="cateDialogForm"
          :rules="cateDialogRules"
          ref="cateDialogRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="cateDialogForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader
              clearable
              v-model="cateselectData"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 脚部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCatedialogVisible"
        width="50%"
         @close="editCateDialogClosed"
      >
        <!-- 主题内容区域 -->
        <el-form
          :model="editCateForm"
          :rules="editCateRules"
          ref="editCateRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 脚部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate(editCateForm.id)"
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
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //   商品分类列表
      cateFrom: [],
      //   总数据条数
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //    表示，将当前列定义为模版列
          type: "template",
          //    表示当前这一列使用模版名称
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "link"
        },
        {
          label: "编辑",
          type: "template",
          template: "opt"
        }
      ],
      //   控制添加分类对话框的显示与隐藏
      addCatedialogVisible: false,
      //   添加分类的表单
      cateDialogForm: {
        //   将要添加的分类的名称
        cat_name: "",
        // 父级分类id
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      //   添加分类表单的验证规则
      cateDialogRules: {
        cat_name: {
          required: true,
          message: "请输入分类名称",
          trigger: "blur"
        }
      },
      //   父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      cateselectData: [],
      //   监听编辑分类对话框的显示与隐藏
      editCatedialogVisible: false,
      //   编辑分类表单
      editCateForm: {
        cat_name: "",
        id:""
      },
      // 编辑分类表单的验证规则
      editCateRules: {
        cat_name: {
          required: true,
          message: "请输入分类名称",
          trigger: "blur"
        }
      }
    };
  },
  created() {
    this.getCateFrom();
  },
  methods: {
    //   获取商品分类数据
    async getCateFrom() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("分类列表数据获取失败");
      }
      //   console.log(res.data);
      // 给cateform 赋值数据
      this.cateFrom = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateFrom();
    },
    // 监听pagenum的改变
    handleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent;
      this.getCateFrom();
    },
    // 显示添加分类对话框
    showaddCatedialog() {
      this.getParentCateList();
      this.addCatedialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("分类对话框的数据获取失败");
      }
      console.log(res.data);
      this.parentCateList = res.data;
    },
    //   选择项触发这个函数
    parentCateChanged() {
      if (this.cateselectData.length > 0) {
        //   父级分类的id
        this.cateDialogForm.cat_pid = this.cateselectData[
          this.cateselectData.length - 1
        ];
        //   为当前分类的等级赋值
        this.cateDialogForm.cat_level = this.cateselectData.length;
        console.log(this.cateselectData);
        return;
      } else {
        this.cateDialogForm.cat_pid = 0;
        this.cateDialogForm.cat_level = 0;
      }
    },
    // 监听对话框的关闭事件,清空对话框
    addCateDialogClosed() {
      this.$refs.cateDialogRef.resetFields();
      this.cateselectData = [];
      this.cateDialogForm.cat_pid = 0;
      this.cateDialogForm.cat_level = 0;
    },
    // 点击按钮 ,提交分类对话框数据,添加分类
    addCate() {
      this.$refs.cateDialogRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.cateDialogForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateFrom();
        this.addCatedialogVisible = false;
      });
    },
    // 点击按钮显示修改分类操作的对话框
    showEditDialog(val) {
      this.editCateForm.cat_name = val.cat_name;
      this.editCateForm.id = val.cat_id;
      this.editCatedialogVisible = true;
    },
    // 监听编辑分类的关闭事件,清空对话框
    editCateDialogClosed(){
        this.$refs.editCateRef.resetFields();
    },
    // 点击按钮,提交编辑分类的表单
    editCate(id){
        console.log(id);
        this.$refs.editCateRef.validate( async valid =>{
        if(!valid) return
        const {data:res}=await this.$http.put('categories/'+id,this.editCateForm)
        if(res.meta.status !== 200){
            return this.$message.error('修改分类失败')
        }
        this.$message.success("修改分类成功")
        this.getCateFrom();
        this.editCatedialogVisible = false;
        })
    },
    // 删除角色
    async deleteCate(id){
        const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //confirm 确定删除
        //cancel 取消删除
       if(result !== 'confirm'){
           return this.$message.error('已取消删除')
       }
        const {data:res} = await this.$http.delete('categories/'+id)

        if(res.meta.status !==200){
           return  this.$message.error('删除角色失败')
        }

        this.$message.success('删除角色成功')
        this.getCateFrom();


    }

  }
};
</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
