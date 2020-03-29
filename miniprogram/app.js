//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  globalData: {},

  //获取openid，由于网络延时，通常在其他页onload之后才会success,所以从其他页传回调函数cb进来。
  getopenid: function (cb) {
    if (this.globalData.openid) {
      typeof cb == "function" && cb(this.globalData.openid)
    } else {
      var that = this
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          //闭包函数内，可以用this,而不需要用that=this
          that.globalData.openid = res.result.openid
          typeof cb == "function" && cb(that.globalData.openid)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查 login 云函数',
          })
          console.log('[云函数][login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
        },
      })

    }
  },
})
