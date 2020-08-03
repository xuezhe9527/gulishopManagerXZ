import request from '@/utils/request'

//GET /admin/product/baseTrademark/{page}/{limit}
// const api_name = '/admin/order'
const api_name = '/admin/product'


export default {
  /*
  获取品牌分页列表(带搜索)
  */
  getPageList(page, limit) {
    return request({
      url: `${api_name}/baseTrademark/${page}/${limit}`,
      method: 'get',
    })
  },
  //增加和修改分页列表
  //POST /admin/product/baseTrademark/save
  //PUT /admin/product/baseTrademark/update
  addOrUpdate(trademark){
    if(trademark.id){
      return request({
        url: `${api_name}/baseTrademark/update`,
        method: 'put',
        data:trademark
      })
    }else{
      return request({
        url: `${api_name}/baseTrademark/save`,
        method: 'post',
        data:trademark
      })
    }
  },

  //删除一个品牌
  //DELETE /admin/product/baseTrademark/remove/{id}
  delete(id){
    return request({
      url: `${api_name}/baseTrademark/remove/${id}`,
      method: 'delete',
    })
  },

  // GET /admin/product/baseTrademark/getTrademarkList  请求获取所有的品牌列表
  getAll(){
    return request({
      url:'/admin/product/baseTrademark/getTrademarkList',
      method:'get'
    })
  }
}
