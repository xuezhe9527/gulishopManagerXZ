<template>
  <div>
    <el-form label-width="100px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="请输入SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :value="tm.id"
            :label="tm.tmName"
            v-for="(tm, index) in trademarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述" label-width="100px">
        <el-input type="textarea" placeholder="请输入SPU描述" rows="4" v-model="spuInfo.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="unusedBaseSaleAttrList.length>0?`还有${unusedBaseSaleAttrList.length}个未使用`:`没有啦`" value=""
        >
          <el-option
            :label="unusedBaseSaleAttr.name"
            :value="unusedBaseSaleAttr.id"
            v-for="(unusedBaseSaleAttr, index) in unusedBaseSaleAttrList"
            :key="unusedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus">添加属性</el-button>
        <el-table border style="width:100%;margin:20px 0" :data="spuInfo.spuSaleAttrList">
          <el-table-column type="index" label="序号" align="center" width="80"></el-table-column>
          <el-table-column label="属性名" width="width" prop="saleAttrName"></el-table-column>
          <el-table-column label="属性值列表" width="400">
            <template slot-scope="{row,$index}">
              <el-tag
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
                closable
                :disable-transitions="false"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width"></el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="$emit('update:visable',false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
    
<script>
export default {
  name: "SpuForm",
  data() {
    return {
      category3Id: "",
      spuInfo: {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [],
      },
      spuImageList: [],
      trademarkList: [],
      baseSaleAttrList: [],
      //图片墙相关数据
      dialogImageUrl: "",
      dialogVisible: false,
    };
  },
  methods: {
    //修改的初始化数据
    async initUpdateSpuForm(spuId, category3Id) {
      this.category3Id = category3Id;
      //发送四个请求来获取数据
      // 1.获取spuinfo
      const spuInfoResult = await this.$API.spu.get(spuId);
      if (spuInfoResult.code === 200) {
        this.spuInfo = spuInfoResult.data;
      }
      // 2.获取spu图片列表
      const imageResult = await this.$API.sku.getSpuImageList(spuId);
      if (imageResult.code === 200) {
        let spuImageList = imageResult.data;
        //查詢得到的图片没有这个照片墙需要的格式信息，所以需要给查找到的数据再加两个属性
        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageList;
      }
      // 3.获取所有品牌信息
      const trademarkResult = await this.$API.trademark.getAll();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }
      // 4.获取spu基础销售属性
      const baseSaleAttrResult = await this.$API.spu.getSaleList();
      if (baseSaleAttrResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrResult.data;
      }
    },
    async initAddSpuForm(category3Id) {
      //添加相对于修改只需要发送两个请求即可
      this.category3Id = category3Id;
      //所有的品牌信息
      ///admin/product/baseTrademark/getTrademarkList

      const trademarkResult = await this.$API.trademark.getAll();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }

      //所有的spu基础销售属性
      ///admin/product/baseSaleAttrList
      const baseSaleAttrResult = await this.$API.spu.getSaleList();
      if (baseSaleAttrResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrResult.data;
      }
    },
    //图片上传类相关方法
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
  },
  computed: {
    //计算未使用的销售属性
    // 需要用所有销售属性和已选销售属性来计算
    // unusedBaseSaleAttrList() {
    //   return this.baseSaleAttrList.filter((baseSaleAttr) => {
    //     this.spuInfo.spuSaleAttrList.every(
    //       (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
    //     );
    //   });
    // },
    unusedBaseSaleAttrList() {
      return this.baseSaleAttrList.filter((baseSaleAttr) =>
        this.spuInfo.spuSaleAttrList.every(
          (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      );
    },
  },
};
</script>
    
<style lang="less" scoped>
</style>