<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">{{spu.spuName}}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="请输入SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input placeholder="请输入SKU价格" type="number" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(KG)">
        <el-input placeholder="请输入SKU重量" type="number" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input placeholder="请输入SKU描述" type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            :label="attrInfo.attrName"
            v-for="(attrInfo, index) in attrInfoList"
            :key="attrInfo.id"
          >
            <el-select placeholder="请输入" v-model="attrInfo.attrIdAndValueId">
              <el-option
                :label="attrValue.valueName"
                v-for="(attrValue, index) in attrInfo.attrValueList"
                :value="attrInfo.id+':'+attrValue.id"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="(spuSaleAttr, index) in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <el-select placeholder="请输入" v-model="spuSaleAttr.saleAttrValueId">
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue, index) in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table border stripe :data="spuImageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="图片">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" width="100px" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button
                v-if="row.isDefault ==='0'"
                type="primary"
                size="mini"
                @click="setDefault(row)"
              >设为默认值</el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSku">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
    
<script>
import { sku } from "@/api";
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      attrInfoList: [],
      spuImageList: [],
      spuSaleAttrList: [],
      selectImageList: [], //选中的图片列表

      //添加sku需要的信息
      skuInfo: {
        //父组件传递过来的数据
        category3Id: "",
        spuId: "",
        tmId: "",
        //vmodel收集的数据
        skuName: "",
        skuDesc: "",
        price: "",
        weight: "",
        //需要整理得到的数据
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: "2",
          //   valueId: "9",
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   saleAttrValueId: 258,
          // },
        ],
        skuImageList: [
          // {
          //   imgName: "下载 (1).jpg",
          //   imgUrl: "http://47.93.148.192:8080/xxx.jpg",
          //   spuImgId: 337, // 当前Spu图片的id
          //   isDefault: "1", // 默认为"1", 非默认为"0"
          // },
        ],
      },
    };
  },
  methods: {
    //点击保存按钮，整理数据skuInfo，发送请求
    async saveSku() {
      let {
        spu,
        skuInfo,
        attrInfoList,
        spuSaleAttrList,
        selectImageList,
      } = this;
      // 1.整理父带过来的数据
      skuInfo.category3Id = spu.category3Id;
      sku.tmId = spu.tmId;
      skuInfo.spuId = spu.id;
      // 2.整理sku的平台属性
      skuInfo.skuAttrValueList = attrInfoList.reduce((pre, item, index) => {
        if (item.attrIdAndValueId) {
          let [attrId, valueId] = item.attrIdAndValueId.split(":");
          pre.push({
            attrId,
            valueId,
          });
        }
        return pre;
      }, []);
      // 3.整理sku的销售属性
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, item, index) => {
        if (item.saleAttrValueId) {
          let { saleAttrValueId } = item;
          pre.push({
            saleAttrValueId,
          });
        }
        return pre;
      }, []);

      // 4.整理图片
      // selectImageList  目前结构 

      // id:4292
      // imgName:null
      // imgUrl:"http://182.92.128.115:8080/group1/M00/00/31/rBFUDF8mvSKAAg5VAAAkZFM9VUU005.jpg"
      // isDefault:"0"
      // spuId:209


      // 最终结构
      //  {
      //   imgName: "下载 (1).jpg",
      //   imgUrl: "http://47.93.148.192:8080/xxx.jpg",
      //   spuImgId: 337, // 当前Spu图片的id
      //   isDefault: "1", // 默认为"1", 非默认为"0"
      // },
      skuInfo.skuImageList =  selectImageList.map(item=>({
        imgName:item.imgName,
        imgUrl:item.imgUrl,
        spuImgId:item.id,
        isDefault:item.isDefault
      }))
      // 打印检查下
      // console.log(skuInfo);

      // 数据整理完成后，要发送请求，整理数据
      const result = await this.$API.sku.addUpdate(skuInfo)
      if(result.code ===200){
        this.$message.success("保存sku成功")
        //关闭sku页面，重置数据
        this.$emit("update:visible",false)    
        this.resetData()   
      }else{
        this.$message.error("保存sku失败")
      }
    
    },
    back(){
      this.$emit('update:visible',false)
      this.resetData()
    },
    //清空（重置）数据
    resetData(){
      this.spu= {}
      this.attrInfoList= []
      this.spuImageList= []
      this.spuSaleAttrList= []
      this.selectImageList= []//选中的图片列表

      //添加sku需要的信息
      this.skuInfo= {
        //父组件传递过来的数据
        category3Id: "",
        spuId: "",
        tmId: "",
        //vmodel收集的数据
        skuName: "",
        skuDesc: "",
        price: "",
        weight: "",
        //需要整理得到的数据
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: [],
      }
    },
    //处理选中的图片的逻辑,val代表的是所有选中的数据组成的数组
    handleSelectionChange(val) {
      // console.log(val);
      this.selectImageList = val;
    },
    //设置默认图片
    setDefault(row) {
      this.spuImageList.forEach((item) => (item.isDefault = "0"));
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    //初始化页面数据
    async initAddSkuForm(spu, category1Id, category2Id) {
      this.spu = spu;
      //需要先发送三个请求拿到数据
      // /admin/product/attrInfoList/2/13/61   获取某个三级分类下的平台属性列表
      let promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      // /admin/product/spuImageList/767  //获取图片的列表
      let promise2 = this.$API.sku.getSpuImageList(spu.id);
      // /admin/product/spuSaleAttrList/767  //获取商品的已选售卖属性
      let promise3 = this.$API.sku.getSpuSaleAttrList(spu.id);

      const result = await Promise.all([promise1, promise2, promise3]);
      // console.log(result);
      this.attrInfoList = result[0].data;
      // this.spuImageList = result[1].data;//后续需要给spuImageList添加响应式属性的值，所以不能直接赋值
      let originSpuImageList = result[1].data;
      originSpuImageList.forEach((item) => (item.isDefault = "0"));
      this.spuImageList = originSpuImageList;
      this.spuSaleAttrList = result[2].data;
    },
  },
};
</script>
    
<style lang="less" scoped>
</style>