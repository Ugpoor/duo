// miniprogram/pages/duo_today/shareproof.js
const logcol = wx.cloud.database().collection("duoLog");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    today: "",
    startTime: "",
    timecount: "00:00:00",
    start: 0,
    end: 0,
    doing: "",
    father: "",
    label: "",
    status: 1,
    istiming: false,
    proof: {
      score:0,
      checker:"",
      sign:"",
      checkDate:0
    },
    owner:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data=JSON.parse(options.data);
    data.proof.checker=getApp().globalData.openid;
    var that=this;
    that.setData(data);

  },

//评分
  scoring:function(e){
    var that=this;
    that.setData({
      proof:{
        score:e.detail.value,
        checker:getApp().globalData.openid,
        checkDate:new Date()
      }
    })
  },

//完成提交
  finishp:function(e){
    var that = this;
    var st = new Date();
    logcol.where({_id:id}).update({
      data:{proof:{
        score:that.data.proof.score,
        checker:that.data.proof.checker,
        checkDate:st
      }},
      success:function(res){
        wx.showToast({
          title: '感谢评价！请若需要修订，请重新提交评价即可。'
        })
        console.log("update success,_id="+res._id);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})