<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>
    <el-card>
      <!-- 默认展示的列表 -->
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
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改"
                size="mini"
                @click="showUpdateDiv(row)"
              ></HintButton>
              <!-- <HintButton type="danger" icon="el-icon-delete" title="删除" size="mini"></HintButton> -->
              <el-popconfirm :title="`您确定要删除${row.attrName}这个属性吗?`" @onConfirm="deleteAttr(row)">
                <!-- <el-button slot="reference">删除</el-button> -->
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加和修改的页面 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名称"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrForm.attrName"
        >添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>
        <el-table :data="attrForm.attrValueList" border style="width: 100%;margin-top:20px">
          <el-table-column label="序号" width="80" align="center" type="index"></el-table-column>
          <el-table-column prop="name" label="属性值名称" width="380">
            <template slot-scope="{row,$index}">
              <el-input
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值的名称"
                size="mini"
                :ref="$index"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display:block;width:100%;height:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <!-- <HintButton icon="el-icon-delete" type="danger" size="mini" title="删除"></HintButton> -->
              <el-popconfirm
                :title="`您确定要删除${row.valueName}这个属性值吗?`"
                @onConfirm="attrForm.attrValueList.splice($index,1)"
              >
                <HintButton
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  title="删除"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" :disabled="attrForm.attrValueList.length===0" @click="saveAttr">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import { attr } from "../../../api";
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
    // console.log(this.$parent.isShowList)
  },
  methods: {
    //删除列表中的一行属性
    async deleteAttr(attr) {
      const result = await this.$API.attr.delete(attr.id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getAttrLIst()
      } else {
        this.$message.error("删除失败");
      }
    },
    //添加或修改完成后保存数据
    async saveAttr() {
      let attr = this.attrForm;
      // 发请求之前先校验下
      //为空则不发请求
      if (attr.attrValueList.length === 0) return;

      //遍历整理数据,不符合规则的就不必要了，还要去除isEdit这个没用的属性
      attr.attrValueList = attr.attrValueList.filter((item) => {
        if (item.valueName.trim() !== "") {
          delete item.isEdit;
          return true;
        }
      });

      const result = await this.$API.attr.addOrUpdate(attr);

      if (result.code === 200) {
        this.$message.success("恭喜您保存成功");
        this.getAttrLIst();
        this.isShowList = true;
      } else {
        this.$message.error("保存失败了");
      }
    },
    //点击span，变成输入框
    toEdit(attrValue, index) {
      (attrValue.isEdit = true),
        this.$nextTick(() => {
          this.$refs[index].focus();
        });
    },
    //input失去焦点，变成span
    toLook(attrValue) {
      //空串直接返回
      if (!attrValue.valueName) return;
      //校验下是否新添加的属性值是否已经存在
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        if (attrValue !== item) {
          return item.valueName === attrValue.valueName;
        }
      });
      // console.log(isRepeat);
      if (isRepeat) {
        this.$message.warning("您输入的属性已经存在了");
        return;
      }
      attrValue.isEdit = false;
    },
    //打开修改页面
    showUpdateDiv(attr) {
      this.isShowList = false;
      //不能直接这么写，因为如果是同一个数据，则取消修改后页面还是会修改，考虑浅拷贝
      //  this.attrForm = attr
      // 也不能使用浅拷贝，因为对象里面还有对象
      // this.attrForm = {...attr}

      this.attrForm = cloneDeep(attr);

      //给每个属性的属性值添加标识数据
      this.attrForm.attrValueList.forEach((item) => {
        //$set保证新添加的属性是响应式的
        this.$set(item, "isEdit", false);
      });
    },
    //添加一条空的数据，弹出input输入框,并且焦点也应该在最后一个输入框上
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: "",
        isEdit: true,
      });
      //默认到添加页面最后一条数据获取焦点
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },

    //打开添加页面并把上次添加的数据清除
    showAddDiv() {
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
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
