<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px">
        </el-table-column>
        <el-table-column label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未支付</el-tag
            >
            <el-tag type="success" v-else> 已支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showAddressDialog"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-location-outline"
            size="mini"
            @click="showProgressDialog"
          ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeDialog"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
      @close="closeDialog"
    >
      <span>我一直报错 获取不到物流进度的数据 呜呜</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      orderList: [],
      total: 0,
      //   修改地址对话框的显示与隐藏
      editDialogVisible: false,
      //   修改地址表单的表单数据
      addressForm: {
        address1: [],
        address2: ""
      },
      addressRules: {
        address1: {
          required: true,
          message: "请选择省市区/县",
          trigger: "blur"
        },
        address2: {
          required: true,
          message: "请输入详细地址",
          trigger: "blur"
        }
      },
      cityData,
      //   物流进度对话框的展示与隐藏
      progressDialogVisible: false,
      progressInfo: [],
      id: "1106975712662"
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    //   获取订单数据列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      this.orderList = res.data.goods;
      this.total = res.data.total;
      console.log(this.queryInfo);
      console.log(this.orderList);
    },
    // pageSize 改变时会触发
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getOrderList();
    },
    // currentPage 改变时会触发
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getOrderList();
    },
    // 点击按钮 显示编辑地址对话框
    showAddressDialog() {
      this.editDialogVisible = true;
    },
    // 修改地址对话框的关闭事件
    closeDialog() {
      this.$refs.addressRef.resetFields();
    },
    // 展示物流进度对话框
    async showProgressDialog() {
      this.$http.get('/kuaidi/1106975712662').then(res => {
        console.log(res)
      })
        // const { data: res } = await this.$http.get('/kuaidi/1106975712662');
        // if (res.meta.status !== 200) {
        //  return  this.$message.error("获取列表数据失败");
        // }
      //   this.$message.success('获取列表数据成功')
      //  this.progressInfo = res.data;

      this.progressDialogVisible = true;

      //    console.log(progressInfo);
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
