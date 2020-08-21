<template>
  <el-card class="sku-list">
    <el-table border stripe :data="skuList">
      <el-table-column label="序号" width="80" type="index" align="center"></el-table-column>
      <el-table-column label="名称" prop="skuName" />
      <el-table-column label="描述" prop="skuDesc" />
      <el-table-column label="默认图片" align="center" width="150px">
        <template slot-scope="{row,$index}">
          <div class="info">
            <div class="pic">
              <img :src="row.skuDefaultImg" alt style="width:80px" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="重量" prop="weight" />
      <el-table-column label="价格" prop="price" />
      <el-table-column label="操作" width="250px">
        <template slot-scope="{row,$index}">
          <HintButton
            v-if="row.isSale===0"
            title="上架"
            type="success"
            size="mini"
            icon="el-icon-top"
            @click="onSale(row.id)"
          ></HintButton>
          <HintButton
            v-if="row.isSale===1"
            title="下架"
            type="success"
            size="mini"
            icon="el-icon-bottom"
            @click="cancelSale(row.id)"
          ></HintButton>
          <HintButton
            title="修改"
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="toUpdateSku(row.id)"
          ></HintButton>
          <HintButton
            title="详情"
            type="primary"
            size="mini"
            icon="el-icon-info"
            @click="showSkuInfo(row.id)"
          ></HintButton>
          <el-popconfirm :title="`确定删除${row.skuName}吗`" @onConfirm="deleteOneSku(row.id)">
            <!-- <el-button slot="reference">删除</el-button> -->
            <HintButton title="删除" type="danger" size="mini" icon="el-icon-delete" slot="reference"></HintButton>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="changeSize"
      @current-change="getSkuList"
      :current-page="page"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="text-align:center"
    ></el-pagination>

    <!-- 抽屉，用来展示skuInfo的详情信息 -->
    <el-drawer
      title="sku商品详情"
      :visible.sync="isShowSkuInfo"
      direction="rtl"
      :before-close="handleClose"
      size="70%"
    >
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{skuInfo.price}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <el-tag
            type="success"
            v-for="(skuAttrValue, index) in skuInfo.skuAttrValueList"
            :key="skuAttrValue.id"
            style="margin-right:5px"
          >{{skuAttrValue.attrId+'-'+skuAttrValue.valueId}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16" >
          <el-carousel trigger="click" height="400px" :autoplay="false" class="img-carousel">
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
export default {
  name: "SkuList",
  data() {
    return {
      skuList: [],
      total: 0,
      page: 1,
      limit: 10,
      isShowSkuInfo: false, //默认抽屉不打开
      skuInfo: {},
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    // 关闭前执行的操作
    handleClose() {
      this.skuInfo = {};
      this.isShowSkuInfo = false;
    },
    //根据skuId查詢skuInfo，打开抽屉
    async showSkuInfo(skuId) {
      this.isShowSkuInfo = true;
      const result = await this.$API.sku.get(skuId);
      this.skuInfo = result.data;
    },
    //每页的数量改变时
    changeSize(size) {
      this.limit = size;
      this.getSkuList();
    },
    // 修改sku，由于sku目前没有对应接口，暂时不写
    toUpdateSku(skuId) {
      this.$message.warning("暂不支持修改");
    },
    //删除一条sku
    async deleteOneSku(skuId) {
      const result = await this.$API.sku.remove(skuId);
      if (result.code === 200) {
        this.$message.success("删除sku成功");
        this.getSkuList(1);
      } else {
        this.$message.error("删除sku失败");
      }
    },
    //上架商品(不用asyc，await)
    onSale(skuId) {
      this.$API.sku.onSale(skuId).then((result) => {
        this.$message.success("上架成功");
        this.getSkuList(this.page);
      });
    },
    //下架商品
    cancelSale(skuId) {
      this.$API.sku.cancelSale(skuId).then((result) => {
        this.$message.success("下架成功");
        this.getSkuList(this.page);
      });
    },

    // this.$API.sku.getList(this.page, this.limit)
    //页面加载的时候查詢skuInfo信息
    async getSkuList(page = 1) {
      this.page = page;
      const result = await this.$API.sku.getList(this.page, this.limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
      }
    },
  },
};
</script>
<style lang="scss">
// 最终版本的样式
.sku-list {
  .el-col-5 {
    font-size: 20px;
    font-weight: bold;
    height: 40px;
    line-height: 40px;
    text-align: right;
    margin-right: 20px;
  }
  .el-col-16 {
    height: 40px;
    line-height: 40px;
  }
  .img-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 100%;
      height: 100%;
    }
    /deep/ .el-carousel__indicator {
      button {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: hotpink;
        display: inline-block;
      }
      
      &.is-active button{
        background:green
      }
    }
  }
}
</style>
<style lang="scss">
// .sku-list {
//   // 一定要加此条件限制, 否则是全局修改
//   .el-carousel__indicator {
//     button {
//       /* 所有指示按钮的样式 */
//       width: 8px;
//       height: 8px;
//       display: inline-block;
//       border-radius: 100%;
//       background-color: hotpink;
//     }
//     &.is-active {
//       button {
//         /* 选中的按钮的样式 */
//         background-color: green;
//       }
//     }
//   }
// }
</style>
<style lang="scss" scoped>
/* 1. 为什么加了/deep/就可以? 2. 为什么el-row/el-col不需要加? */
/*  
问题1: 
有scoped, 没有/deep/: .sku-list .img-carousel .el-carousel__indicator button[data-xxx]
加上/deep/: .sku-list[data-xxx] .img-carousel .el-carousel__indicator button
问题2:  
  子组件的根标签有我当前组件的data属性, 而el-row / el-col没有子标签, 只有根标签, 改的就是根标签

结论: 如果是去修改UI组件的的内部根标签不需要要深度选择器主可以修改, 比如: el-row/el-col
      如果是去修改UI组件的内部子标签需要加深度选择器才可以修改, 比如: Carousel的指示器样式
*/
// .sku-list {
//   .el-row {
//     height: 40px;
//     .el-col {
//       line-height: 40px;
//       &.el-col-5 {
//         font-size: 18px;
//         font-weight: bold;
//         text-align: right;
//         margin-right: 20px;
//       }
//     }
//   }
//   .img-carousel {
//     width: 400px;
//     border: 1px solid #ccc;
//     img {
//       width: 100%;
//       height: 100%;
//     }

//     /deep/ .el-carousel__indicator {
//       button {
//         /* 所有指示按钮的样式 */
//         width: 8px;
//         height: 8px;
//         display: inline-block;
//         border-radius: 100%;
//         background-color: hotpink;
//       }
//       &.is-active {
//         button {
//           /* 选中的按钮的样式 */
//           background-color: green;
//         }
//       }
//     }
//   }
// }
</style>
