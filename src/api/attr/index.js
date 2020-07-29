import request from '@/utils/request'

// const api_name = '/admin/order'
const api_name = '/admin/product'


export default {
  /*
  获取属性列表
  GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  */
  getList(category1Id,category2Id,category3Id) {
    return request({
      url: `${api_name}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
      method: 'get',
    })
  },


  //增加或修改属性
  //  POST /admin/product/saveAttrInfo
  addOrUpdate(attr) {
    return request({
      url: `${api_name}/saveAttrInfo`,
      method: 'post',
      data:attr
    })
  },


  //删除属性
  // DELETE /admin/product/deleteAttr/{attrId}
  delete(attrId){
    return request({
      url: `${api_name}/deleteAttr/${attrId}`,
      method: 'delete',
    })
  }
}