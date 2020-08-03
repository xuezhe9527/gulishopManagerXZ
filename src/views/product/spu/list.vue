<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="!isShowSkuForm && !isShowSpuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom:20px"
          @click="showAddSpuForm"
        >添加属性</el-button>
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column label="SPU名称" width="width" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" width="600" prop="description"></el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <HintButton
                type="primary"
                icon="el-icon-plus"
                title="增加sku"
                size="mini"
                @click="showAddSkuForm"
              ></HintButton>
              <HintButton
                type="primary"
                icon="el-icon-edit"
                title="修改spu"
                size="mini"
                @click="showUpdateSpuForm(row.id)"
              ></HintButton>
              <HintButton type="info" icon="el-icon-info" title="查看所有的sku" size="mini"></HintButton>
              <!-- <el-popconfirm :title="`您确定要删除${row.attrName}这个属性吗?`" @onConfirm="deleteAttr(row)"> -->
              <HintButton
                type="danger"
                icon="el-icon-delete"
                title="删除spu"
                size="mini"
                slot="reference"
              ></HintButton>
              <!-- </el-popconfirm> -->
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align:center"
          background
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout=" prev, pager, next, jumper, ->,  sizes, total"
          :total="total"
          @current-change="getSpuList"
        ></el-pagination>
      </div>
      <SpuForm v-show="isShowSpuForm" :visable.sync="isShowSpuForm" ref="spu"></SpuForm>
      <SkuForm v-show="isShowSkuForm"></SkuForm>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "../components/SpuForm";
import SkuForm from "../components/SkuForm";
export default {
  name: "SpuList",
  data() {
    return {
      isShowList: true,
      page: 1,
      limit: 3,
      total: 0,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],

      isShowSpuForm: false,
      isShowSkuForm: false,
    };
  },
  methods: {
    //展示添加sku的组件
    showAddSkuForm() {
      this.isShowSkuForm = true;
    },
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spu.initAddSpuForm(this.category3Id)
    },
    showUpdateSpuForm(spuId) {
      this.isShowSpuForm = true;
      // 点击修改页面，需要初始化查詢数据，这个方法在子组件当中
      this.$refs.spu.initUpdateSpuForm(spuId,this.category3Id)
    },
    //接受子组件的值
    handlerCategory({ categoryId, level }) {
      if (level === 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    //获取属性列表，用来遍历展示
    async getSpuList(page = 1) {
      this.page = page;
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.spu.getList(
        this.page,
        this.limit,
        this.category3Id
      );
      if (result.code === 200) {
        let { records, total } = result.data;
        this.spuList = records;
        this.total = total;
      }
    },
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>
