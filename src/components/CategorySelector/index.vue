<template>
  <el-form :inline="true" :model="cForm" class="demo-form-inline" :disabled="!isShowList">
    <el-form-item label="一级分类">
      <el-select v-model="cForm.category1Id" placeholder="选择一级分类" @change="handlerC1" >
        <el-option
          :label="c1.name"
          :value="c1.id"
          v-for="(c1, index) in category1List"
          :key="c1.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select v-model="cForm.category2Id" placeholder="选择二级分类" @change="handlerC2">
        <el-option
          :label="c2.name"
          :value="c2.id"
          v-for="(c2, index) in category2List"
          :key="c2.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select v-model="cForm.category3Id" placeholder="选择三级分类" @change="handlerC3">
        <el-option
          :label="c3.name"
          :value="c3.id"
          v-for="(c3, index) in category3List"
          :key="c3.id"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
    
<script>
export default {
  name: "CategorySelector",
  props:['isShowList'],
  mounted(){
    console.log(this.$parent.isShowList)
  },
  data() {
    return {
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      //用来保存查詢到的数据
      category1List: [],
      category2List: [],
      category3List: [],
    };
  },
  mounted() {
    this.getcategory1List();
  },
  methods: {
    //一级分类选中后，查詢二级分类并展示
    async handlerC1(category1Id) {
      //一级分类选中后应该先清空二三级
      this.cForm.category2Id = "";
      this.cForm.category3Id = "";
      this.category2List = [];
      this.category3List = [];
      //将自己选择的id传给父组件
      this.$emit("handlerCategory", { categoryId: category1Id, level: 1 });

      const result = await this.$API.category.getCategorys2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
      }
    },
    //二级分类选中后，查询三级分类并展示
    async handlerC2(category2Id) {
      this.cForm.category3Id = "";
      this.category3List = [];

      this.$emit("handlerCategory", { categoryId: category2Id, level: 2 });
      const result = await this.$API.category.getCategorys3(category2Id);
      if (result.code === 200) {
        this.category3List = result.data;
      }
    },
    handlerC3(category3Id){
      this.$emit("handlerCategory", { categoryId: category3Id, level: 3 });
    },
    //默认查詢一级分类
    async getcategory1List() {
      const result = await this.$API.category.getCategorys1();
      if (result.code === 200) {
        this.category1List = result.data;
      }
    },
  },
};
</script>
    
<style lang="less" scoped>
</style>