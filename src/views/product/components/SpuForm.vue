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
          :on-success="handleUploadSuccess"
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
          :placeholder="unusedBaseSaleAttrList.length>0?`还有${unusedBaseSaleAttrList.length}个未使用`:`没有啦`"
          v-model="unusedBaseSaleAttrIdAndName"
        >
          <el-option
            :label="unusedBaseSaleAttr.name"
            :value="unusedBaseSaleAttr.id+':'+unusedBaseSaleAttr.name"
            v-for="(unusedBaseSaleAttr, index) in unusedBaseSaleAttrList"
            :key="unusedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加属性</el-button>
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
                @close="row.spuSaleAttrValueList.splice(index,1)"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>

              <el-input
                placeholder="请输入"
                size="small"
                ref="saveTagInput"
                style="width:150px"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                @blur="handleInputConfirm(row)"
                @keyup.enter.native="handleInputConfirm(row)"
              ></el-input>
              <el-button v-else size="small" class="button-new-tag" @click="showInput(row)">+ 添加属性值</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-button type="danger" icon="el-icon-delete" size="mini"  @click="spuInfo.spuSaleAttrList.splice($index,1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSpu">保存</el-button>
        <el-button @click="back">取消</el-button>
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
      unusedBaseSaleAttrIdAndName: "", //用来收集未使用的销售属性ID和属性名
      //图片墙相关数据
      dialogImageUrl: "",
      dialogVisible: false,
    };
  },
  methods: {
    //点击返回，返回list页面
    back(){
      this.$emit("update:visable", false)
      this.$emit("cancel")
    },
    //添加成功，清空表单数据
    resetData(){
      this.category3Id= ""
      this.spuInfo= {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [],
      },
      this.spuImageList= []
      this.trademarkList= []
      this.baseSaleAttrList= []
      this.unusedBaseSaleAttrIdAndName= "" //用来收集未使用的销售属性ID和属性名
      //图片墙相关数据
      this.dialogImageUrl= ""
      this.dialogVisible= false
    },
    //点击保存按钮，发送请求
    async saveSpu() {
      // 发送请求前需要整理下数据（spuInfo）
      // 先获取基本参数数据
      let { spuInfo, spuImageList, category3Id } = this;

      // 1. spuInfo添加category3Id
      spuInfo.category3Id = category3Id;

      // 2.整合图片
      spuImageList = spuImageList.map((item) => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.imgUrl,
      }));
      spuInfo.spuImageList = spuImageList

      // 3.删除销售属性（已选属性内部多余的数据）
      spuInfo.spuSaleAttrList.forEach(item=>{
        delete item.isEdit
        delete item.saleAttrValueName
      })

      // console.log(spuInfo);
      const result = await this.$API.spu.addUpdate(spuInfo)
      if(result.code===200){
        this.$message.success("保存成功")
        this.$emit("update:visable", false)
        this.$emit("saveSuccess")
      }else{
        this.$message.error("保存失败")
      }

    },

    //输入框失去焦点或者回车后，变成文本框,并保存对应数据
    handleInputConfirm(row) {
      //先把row内收集的数据获取下
      let { saleAttrValueName, baseSaleAttrId } = row;
      //判断输入的值为空
      if (!saleAttrValueName.trim()) return;
      //怕段是否重复
      let isRepeat = row.spuSaleAttrValueList.some((item) => {
        item.saleAttrValueName === saleAttrValueName;
      });
      if (isRepeat) {
        this.$message.warning("您输入的值已经存在");
        return;
      }
      row.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId,
      });
      row.isEdit = false;
      row.saleAttrValueName = "";
    },

    //点击添加按钮，变成文本输入框
    showInput(row) {
      // 哪一行被点击，给哪一行加上isEdit true 且要求是响应式的
      this.$set(row, "isEdit", true);
      //自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    //点击select旁边的添加属性，可以多增加一个销售属性（已选属性）
    addSaleAttr() {
      //   {
      //   "baseSaleAttrId": "1",
      //   "saleAttrName": "选择颜色",
      //   "spuSaleAttrValueList": [
      //     {
      //       "saleAttrValueName": "a",
      //       "baseSaleAttrId": "1"
      //     }
      //   ]
      // }
      let [
        baseSaleAttrId,
        saleAttrName,
      ] = this.unusedBaseSaleAttrIdAndName.split(":");
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      });
      this.unusedBaseSaleAttrIdAndName = ""; //清空select的选中项
    },
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
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleUploadSuccess(response, file, fileList) {
      this.spuImageList = fileList;
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