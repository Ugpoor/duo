// pages/duo_item.js
const logcol = wx.cloud.database().collection("duoLog");
const todocol = wx.cloud.database().collection("duoTodo");
const _=wx.cloud.database().command;

//是否日期8位格式
function isDate(e){
  var reg = new RegExp("^\\d{4}\\d{2}\\d{2}$");
  return reg.test(e)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskowner:"",  //taskowner 为空则为所有人任务，需要openid
    startDay:"",
    endDay:"",  
    repeatDays:0,
    startTime: "",
    standardTime: "",
    doing: "",
    father: "",
    label: {type:"plan"},
    needproof: false,
    proofSetup:{}, //未来用于指定核实人等条件
    score:0,      //得分
    todoList:[],
    onceCheck:true,
    todelete:[]
  },

  /**
   * 生命周期函数--监听页面加载（注意如果超过1000条需要循环取，参考微信案例）
   */
  onLoad: function (options) {
    var that = this;
    todocol.get({
      success: function (res) {
        var dl = res.data
        if (dl.length != 0) {
          that.setData({
            todoList: dl
          })
        }
      }
    })
  },

//新建按钮
  create:function(e){
    var that = this;
    var da = that.data;
    var doin=da.doing
    if (doin === "" || da.startDay==="" || da.startTime==="" || da.endDay===""||da.repeat=="") {
      wx.showToast({
        title: '请填写完整。',
        image: '../../images/icon_no2.png'
      })
    }
    else {
      todocol.where({
        doing:doin
      }).get({
        success:res=>{
          if(res.data.length===0){
            todocol.add({
              data: {
                taskowner:da.taskowner,
                startDay: da.startDay,
                endDay: da.endDay,
                repeat: da.repeat,
                repeatDays: da.repeatDays,
                startTime: da.startTime,
                standardTime: da.standardTime,
                doing: doin,
                father: da.father,
                needproof: da.needproof,
                score:da.score
              },
              success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                this.setData(data);
                wx.showToast({
                  title: '工作任务提交成功'
                })
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              }
            });
            
            todocol.get({
              success: res => {
                var dl = res.data;
                that.setData({
                  todoList: dl
                });
              }
            })
          }
          else{
            wx.showToast({
              title: '任务名称重复.'
            })
          }
        }
      })
      }
    },

    //重来
    Reset:function(){
      var that=this;
      that.setData({
        taskowner:"",
        startDay: "",
        endDay: "",
        repeat: "once",
        repeatDays: 0,
        startTime: "",
        standardTime: "",
        doing: "",
        father: "",
        label: { type: "plan" },
        needproof: false,
        score:0,
        proofSetup: {}, //未来用于指定核实人等条件
        onceCheck:true
      })
    },

//做什么
  catchdoing:function(e){
    var iv = e.detail.value.replace("。", ".").replace(",", ".").replace("，", ".")
    var dot = iv.indexOf(".")
    if (dot > 1) {
      this.setData({
        doing: iv.substr(dot + 1),
        father: iv.substr(0, dot)
      })
    } else {
      this.setData({
        doing: iv
      })
    }
  },

  //起始日期
  catchStartDay:function(e){
    var v=e.detail.value;
    if(isDate(v)){
      this.setData({
        startDay: v
      })
    }
    else{
      wx.showToast({
        title: '请填写正确日期格式(YYYYMMDD)。',
        image: '../../images/icon_no2.png'
      });
      this.setData({
        startDay:''
      });
    }
  },

  //终止日期
  catchEndDay: function(e){
    var v = e.detail.value;
    var that=this;
    if (isDate(v)) {
      that.setData({
        endDay: v
      })
    }
    else {
      wx.showToast({
        title: '请填写正确日期格式(YYYYMMDD)。',
        image: '../../images/icon_no2.png'
      });
      that.setData({
        endDay: ''
      });
    }
  },

//设定频率
  bindRepeat: function(e){
    this.setData({
      repeat:e.detail.value
    })
  },

  //每隔X天
  catchRepeatDays:function(e){
    var v=e.detail.value;
    if (/^[0-9]*$/.test(v)){
      this.setData({
        repeatDays:parseInt(v,10)
      })
    }
    else{
      wx.showToast({
        title: '请填写正确日期格式(YYYYMMDD)。',
        image: '../../images/icon_no2.png'
      });
      this.setData({
        repeatDays:0
      })
    }
  },

//启动时间
  catchStartTime:function(e){
    var v=e.detail.value;
    if(v.length>=8){
      if (/([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(v)) {
        this.setData({
          startTime: v
        })
      }
      else {
        wx.showToast({
          title: '请填写正确时间格式(HH:MM:SS)。',
          image: '../../images/icon_no2.png'
        })
      }
    }
    else{
      if(/[0-9]{2}/.test(v)){
        v+=":"
      }
    }
   
  },

//需要证明
  needp:function(e){
    this.setData({
      needproof:e.detail.value
    })
  },

//标准时长
  catchStandard:function(e){
    var v = e.detail.value;
    if (/^[0-9]{2}(:|：)[0-9]{2}(:|：)[0-9]{2}$/.test(v)) {
      this.setData({
        standardTime: v
      })
    }
    else {
      wx.showToast({
        title: '请填写正确时间格式(HH:MM:SS)。',
        image: '../../images/icon_no2.png'
      })
    }
  },

//选择列表清单
  todoCheck:function(e){
    var that=this;
    that.setData({
      todelete:e.detail.value
    })
  },

  //按钮
  delete:function(e){
    var that =this;
    var dellist=this.data.todelete;
    for(let todel of dellist){
      todocol.doc(todel).remove({
        success: function (res) {
          todocol.get({
            success: res => {
              var dl = res.data;
              that.setData({
                todoList: dl
              });
            }
          })
        }
      })
    };
  },

  catchscore: function (e) {
    var that = this;
    that.setData({
      score: e.detail.value
    })
  },

  catchowner: function(e) {
    var that = this;
    that.setData({
      taskowner: e.detail.value
    })
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