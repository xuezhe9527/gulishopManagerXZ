<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom:20px"
          @click="showAddDiv"
          :disabled="!category3Id"
        >添加属性</el-button>
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="180"></el-table-column>
          <el-table-column label="属性值列表" width="780">
            <template slot-scope="{row,$index}">
              <el-tag
                style="margin-right:10px"
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <HintButton type="warning" icon="el-icon-edit" title="修改" size="mini"></HintButton>
              <HintButton type="danger" icon="el-icon-delete" title="删除" size="mini"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名称"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" :disabled="!attrForm.attrName">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>
        <el-table :data="attrForm.attrValueList" border style="width: 100%;margin-top:20px">
          <el-table-column  label="序号" width="80" align="center" type="index"></el-table-column>
          <el-table-column prop="name" label="属性值名称" width="380">
              <template slot-scope="{row,$index}">
                 <el-input v-model="row.valueName" placeholder="请输入属性值的名称" size="mini"></el-input>
              </template>
          </el-table-column>
          <el-table-column  label="操作">
             <template>
              <HintButton icon="el-icon-delete" type="danger" size="mini" title="删除"></HintButton>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" >保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AttrList",
  data() {
    return {
      attrList: [],
      category1Id: "",
      category2Id: "",
      category3Id: "",

      //默认展示列表页
      isShowList: true,

      // attrForm: {
      //   attrName: "",
      //   attrValueList: [],
      //   categoryId: "",
      //   categoryLevel: 3,
      // },

      //收集要添加的属性
      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
      },
    };
  },
  mounted() {
    // this.getAttrLIst();
  },
  methods: {
    //添加一条空的数据，弹出input输入框
    addAttrValue(){
      this.attrForm.attrValueList.push({
        attrId:this.attrForm.id,
        valueName:''
      })
    },

    //打开添加页面
    showAddDiv() {
      //清空上次的记录
      this.attrForm= {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      },

      //关闭展示页，打开添加页面
      this.isShowList = false;
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
        this.getAttrLIst();
      }
    },
    //获取属性列表，用来遍历展示
    async getAttrLIst() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
  },
};
</script>
