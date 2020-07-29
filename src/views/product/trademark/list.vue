<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
    <el-table :data="trademarkList" border style="width: 100%;margin:20px 0">
      <el-table-column label="序号" type="index" width="100" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="300"></el-table-column>
      <el-table-column label="品牌LOGO" width="300">
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" style="height:80px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row,$index}">
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-edit"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteOneTradeMark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      background
      style="text-align:center"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
    ></el-pagination>

    <!-- Form -->
    <el-dialog title="添加" :visible.sync="isShowDialog">
      <el-form :model="form" :rules="rules" ref="form">
        <el-form-item label="品牌名称" :label-width="formLabelWidth" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth" prop="logoUrl">
          <!-- 图片上传upload组件  action需要访问实际的服务器地址（跨域问题）-->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      // isCanAdd: true,
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],
      isShowDialog: false, //对话框默认关闭
      formLabelWidth: "100px",
      form: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
          // 使用自定义的验证规则
          { validator: this.validateTmName, trigger: "change" },
        ],
        logoUrl: [
          { required: true, message: "请上传合适的照片", trigger: "change" },
        ],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    //自定义的验证规则
    validateTmName(rule, value, callback) {
      if (value.length < 2 || value.length > 5) {
        callback(new Error("品牌的名称要在2-5之间"));
      } else {
        callback();
      }
    },
    //查詢列表
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    //打开添加对话框
    showAddDialog() {
      this.form = {
        tmName: "",
        logoUrl: "",
      };

      this.isShowDialog = true;
    },
    //打开修改对话框
    showUpdateDialog(trademark) {
      // this.form = trademark;
      this.form = { ...trademark };
      this.isShowDialog = true;
    },

    //用户上传之后的操作
    handleAvatarSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      this.form.logoUrl = res.data;
      console.log(this.form.logoUrl);
    },
    //图片上传之前的操作
    beforeAvatarUpload(file) {
      const typeArr = ["image/jpeg", "image/png"];
      const isJPGOrPNG = typeArr.indexOf(file.type) !== -1;
      const isLt500K = file.size / 1024 < 500;

      if (!isJPGOrPNG) {
        this.$message.error("上传图片只能是 JPG或PNG 格式!");
      }
      if (!isLt500K) {
        this.$message.error("上传图片大小不能超过 500K!");
      }
      console.log(isJPGOrPNG, isLt500K);
      // return (isJPGOrPNG && isLt500K)
      if (!(isJPGOrPNG && isLt500K)) {
        // this.isCanAdd = false; //这里只是暂时的解决方案
      }
    },
    //添加或修改trade
    addOrUpdateTrademark() {
      // if (!this.isCanAdd) {
      //   return;
      // }

      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let trademark = this.form;
          const result = await this.$API.trademark.addOrUpdate(trademark);
          //成功之后的操作 提示用户，重新请求，关闭对话框
          if (result.code === 200) {
            // this.$message.success("添加品牌成功");
            this.$message.success(`${trademark.id ? "修改" : "添加"}品牌成功`);
            this.getTrademarkList(trademark.id ? this.page : 1);
            this.isShowDialog = false;
          } else {
            this.$message.error(`${trademark.id ? "修改" : "添加"}品牌失败`);
            this.isShowDialog = false;
          }
        } else {
          console.log("验证失败");
          return false;
        }
      });
    },

    //删除一个trademark
    deleteOneTradeMark(trademark) {
      this.$confirm(`确定要删除${trademark.tmName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const result = await this.$API.trademark.delete(trademark.id);
          if (result.code === 200) {
            this.$message.success("删除品牌成功");
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            );
          } else {
            this.$message.error("删除品牌失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>
<style >
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
