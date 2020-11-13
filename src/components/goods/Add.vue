<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 提示文字 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 横向步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 纵向步骤条 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        ref="addGoodsRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <!-- 级联选择器 选择分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="goodsCateList"
                :props="goodsProps"
                @change="goodsHandleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单item -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyCateList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染静态数据表单 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyCateList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <el-upload
              :action="upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 副文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片详细展示的对话框 -->
    <el-dialog title="图片预览" :visible.sync="photoDialogVisible" width="50%">
      <img :src="photoPath" alt="" class="photoview" />
    </el-dialog>
  </div>
</template>

<script>
// 导入可以使用强拷贝的插件
import _ from "lodash";
export default {
  data() {
    return {
      tabPosition: "left",
      activeIndex: "0",
      // 添加商品的表单
      addGoodsForm: {
        goods_name: "",
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: "",
        pics: [],
        attrs: []
      },
      //   添加商品表单的验证规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //   商品分类列表
      goodsCateList: [],

      goodsProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //   商品动态参数列表
      manyCateList: [],
      //   商品静态参数列表
      onlyCateList: [],
      //   上传路径
      upload: "http://127.0.0.1:8888/api/private/v1/upload",
      //   上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //   图片详细展示的对话框的显示与隐藏
      photoDialogVisible: false,
      //   图片路径
      photoPath: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      //   console.log(res.data);
      this.goodsCateList = res.data;
    },
    // 选中分类触发的事件
    goodsHandleChange() {
      console.log(this.addGoodsForm.goods_cat);
      //   只能选择三级分类的设置
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = [];
      }
    },
    // 判断标签页切换的事件
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // 点击tab切换事件
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("获取参数失败");
        }
        // console.log(res.data);
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyCateList = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("获取参数失败");
        }
        console.log(res.data);
        this.onlyCateList = res.data;
      }
    },
    // 点击图片触发的事件
    handlePreview(file) {
      console.log(file);
      (this.photoPath = file.response.data.url),
        (this.photoDialogVisible = true);
    },
    // 图片移除事件
    handleRemove(file) {
      //   console.log(file);
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics中找到这个对应图片的索引值
      const i = this.addGoodsForm.pics.findIndex(x => x.pic === filePath);
      // 3.调用数组splice方法把该图片对象从pics中删除
      this.addGoodsForm.pics.splice(i, 1);
    },
    // 上传成功 将图片绑定到表单数据中
    handleSuccess(response) {
      //   console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象，push到pics中
      this.addGoodsForm.pics.push(picInfo);
      //   console.log(this.addGoodsForm);
    },
    // 添加商品
    add() {
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error("请填写必要的表单项");
        // 处理goods_cat 使其为以为','分割的分类列表
        const from = _.cloneDeep(this.addGoodsForm);
        from.goods_cat = from.goods_cat.join(",");
        // 处理动态参数
        this.manyCateList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addGoodsForm.attrs.push(newInfo);
        });
        // 处理静态参数
         this.onlyCateList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addGoodsForm.attrs.push(newInfo);
        });
        from.attrs = this.addGoodsForm.attrs
        console.log(from);
        const { data: res } = await this.$http.post("goods", from);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败");
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      });
    }
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-steps {
  margin-top: 30px;
  margin-bottom: 30px;
}
.el-tag {
  margin-left: 10px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.photoview {
  width: 100%;
}
.quill-editor {
  margin-bottom: 10px;
}
</style>
