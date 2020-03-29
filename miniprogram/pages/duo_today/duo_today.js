// pages/duo_today/duo_today.js
var intt;
const logcol = wx.cloud.database().collection("duoLog");
const todocol = wx.cloud.database().collection("duoTodo");
var logData = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
  startTime: "",
  timecount: '00:00:00.00',
  start: 0,
  end: 0,
  doing: "",
  father: "",
  label: {},
  status: 0,
  istiming: false,
  score:0,   
  proof: {},
  needproof: false,
  standardTime:"",
  lateStandard: ""
};

function getArrayProps(array, key) {
  var key = key || "value";
  var res = [];
  if (array) {
    array.forEach(function (t) {
      res.push(t[key]);
    });
  }
  return res;
};

/*
function submitLog(that,stat,msg){
  logcol.add({
    data: {
      today: that.data.today,
      startTime: that.data.startTime,
      timecount: that.data.timecount,
      start: that.data.start,
      end: stat===0?0:new Date(),
      doing: that.data.doing,
      father: that.data.father,
      label: that.data.label,
      status: stat,
      istiming: false,
      proof: that.data.proof,
    },
    success: res => {
      // 在返回结果中会包含新创建的记录的 _id
      clearInterval(intt);
      this.setData(logData);
      wx.showToast({
        title: msg+'成功'
      })
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
    },
    fail: err => {
      wx.showToast({
        title: msg+'失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    }
  })
}
*/
/*
function queryLog(that){
  var st = new Date();
  logcol.where({ today: td }).get({
    success: function (res) {
      var dl = res.data
      if (dl.length === 0) {
        wx.showToast({
          icon: 'loading',
          title: '新的一天开始了'
        })
        that.setData({
          today: td,
          doList: []
        })
      }
      else {
        that.setData({
          doList: dl
        })
      }
    }
  })
}
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: "",
    placeHDo:"做什么",
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    startTime: "",
    timecount: '00:00:00.00',
    start: 0,
    end: 0,
    doing: "",
    father: "",
    label: {},
    status: 0, //status:0,current timing/hang;1,done;2,todo;
    istiming: false,
    proof: {},
    needproof: false,
    score:0,  //总分，汇总自各个proof
    doList: [],
    standardTime: "",
    lateStandard:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var st = new Date();
    var td = st.toDateString();
    that.setData({
      today: td,
      needproof:false,
      placeHDo:"做什么"
    });

    logcol.where({
      today: td,
      _openid: getApp().globalData.openid
    }).get({
      success: function(res) {
        var dl = res.data;
        var dlol = dl.length;
        var tdl;
        var currentdo=getArrayProps(dl,"doing");
        var currentfa=getArrayProps(dl,"father");
        //添加计划任务
        todocol.get({
          success: function (res) {
             tdl = res.data;
            for(let d of tdl){
             // console.log("d.father:"+d.father+","+( currentfa.indexOf(d.father)));
              if (currentdo.indexOf(d.doing)==-1 ||currentfa.indexOf(d.father)==-1){
                var task = {
                  today: td,
                  startTime: "",
                  timecount: '00:00:00.00',
                  start: 0,
                  end: 0,
                  doing: d.doing,
                  father: d.father,
                  label: d.label,
                  status: 2,
                  istiming: false,
                  needproof: d.needproof,
                  score:0,
                  proof: {},
                  owner: getApp().globalData.openid,
                  standardTime: d.standardTime,
                  lateStandard: ""
                };
              // console.log("task："+JSON.stringify(task));
                dl.push(task);
              // console.log("add dl:"+JSON.stringify(dl))
              }
            }

            if (dlol === 0) {
              wx.showToast({
                icon: 'loading',
                title: '新的一天开始了'
              })
              that.setData({
                today: td,
                doList: dl,
                placeHDo:"做什么"
              })
            }
            else {
              that.setData({
                doList: dl,
                placeHDo:"做什么"
              })
            };
          }
        });
      }
    });
  },

  //开始/暂停按钮
  start: function(e) {
    var that = this;
    var st = new Date();
    var stTStr=st.toTimeString();
    clearInterval(intt);
    if (that.data.doing == "") {
      wx.showToast({
        title: '请填写“做什么”。',
        image: '../../images/icon_no2.png'
      })
    } else {
      if (that.data.istiming == false) {
        var stT = that.data.startTime;
        var start = that.data.start;
        //时间重置
        that.setData({
          /*
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
            startTime: st.toLocaleTimeString(),
            start: st,
          */
          start: start === 0 ? st : start,
          startTime: stT === "" ? stTStr.substr(0,stTStr.indexOf(" ")) : stT,
          istiming: true,
          placeHDo:"做什么"
        })
        intt = setInterval(function() {
          that.timer()
        }, 50)
      } else {
        //（暂停）
        clearInterval(intt);
        that.setData({
          istiming: false,
          end: st
        });
      }
    }
  },

  //重来
  Reset: function() {
    var that = this
    that.setData({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      startTime: "",
      timecount: '00:00:00.00',
      start: 0,
      end: 0,
      doing: "",
      father: "",
      label: {},
      status: 0,
      istiming: false,
      score:0,
      proof: {},
      placeHDo:"做什么"
    })
    clearInterval(intt);
  },

  //完成
  finish: function() {
    var that = this;
    var st = new Date();
    var td = st.toDateString();
    var thatdata=that.data;
    var sdt=thatdata.standardTime;
    var dv = thatdata.doing;
    var fv = thatdata.father;
    var strt = thatdata.start;
    var task = {
      id: thatdata._id,
      today: thatdata.today,
      startTime: thatdata.startTime,
      timecount: thatdata.timecount,
      start:strt,
      end: st,
      doing: dv,
      father: fv,
      score:thatdata.score,
      label: thatdata.label,
      status: 1,
      istiming: false,
      proof: that.data.proof,
      needproof:that.data.needproof,
      owner: getApp().globalData.openid,
      standardTime: sdt,
      lateStandard:sdt===""?"":that.data.hour*3600+that.data.minute*60+that.data.second-parseInt(sdt.substr(0,2))*3600-parseInt(sdt.substr(3,2))*60-parseInt(sdt.substr(6,2))
    };

    var dl=that.data.doList;
    if (dv != "" && strt != 0) {
     var dupl = dl.filter(function (i) {
          return i.status != 2 && i.doing === dv && i.father === fv
        }).length;
      if (dupl > 0) {
        wx.showToast({
          title: '做什么名称重复',
          image: '../../images/icon_no2.png'
        })
      }
      else {
        //console.log("task:"+JSON.stringify(task));
        logcol.add({
          data: task,
          success: res => {
            clearInterval(intt);

            var todol=dl.filter(function(m){
              return (m.status===2 && (m.doing!=dv || m.father!=fv))||m.status!=2
            });
            that.setData(logData);
            that.setData({
              doList:todol,
              placeHDo:"做什么"
            })
            wx.showToast({
              title: '工作记录提交成功'
            })
            //console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)

           }
        });


      logcol.where({
        today: td,
        _openid: getApp().globalData.openid
      }).get({
        success: function (res) {
          var dl = res.data;
          var dlol = dl.length;
          var tdl;
          var currentdo = getArrayProps(dl, "doing");
          var currentfa = getArrayProps(dl, "father");
          //添加计划任务
          todocol.get({
            success: function (res) {
              tdl = res.data;
              for (let d of tdl) {
               // console.log("d.father:" + d.father + "," + (currentfa.indexOf(d.father)));
                if (currentdo.indexOf(d.doing) == -1 || currentfa.indexOf(d.father) == -1) {
                  var task = {
                    today: td,
                    startTime: "",
                    timecount: '00:00:00.00',
                    start: 0,
                    end: 0,
                    doing: d.doing,
                    father: d.father,
                    label: d.label,
                    score:d.score,
                    status: 2,
                    istiming: false,
                    needproof: d.needproof,
                    proof: {},
                    owner: getApp().globalData.openid,
                    standardTime: d.standardTime,
                    lateStandard: ""
                  };
                  // console.log("task："+JSON.stringify(task));
                  dl.push(task);
                  // console.log("add dl:"+JSON.stringify(dl))
                }
              }

              if (dlol === 0) {
                wx.showToast({
                  icon: 'loading',
                  title: '新的一天开始了'
                })
                that.setData({
                  today: td,
                  doList: dl
                })
              }
              else {
                that.setData({
                  doList: dl
                })
              };
            }
          });
        }
      });
        }
    } else {
      wx.showToast({
        title: '请完成事件时间记录才提交。',
        image: '../../images/icon_no2.png'
      })
    };
    if (that.data.needproof) {
      wx.navigateTo({
        url: "shareproof?data=" + JSON.stringify(task),
      })
    }
  },

  timer: function(e) {
    var that = this;
    //console.log(e.currentTarget.dataset.millisecond)
    that.setData({
      millisecond: that.data.millisecond + 5
    })
    if (that.data.millisecond >= 100) {
      that.setData({
        millisecond: 0,
        second: that.data.second + 1
      })
    }
    if (that.data.second >= 60) {
      that.setData({
        second: 0,
        minute: that.data.minute + 1
      })
    }
    if (that.data.minute >= 60) {
      that.setData({
        minute: 0,
        hour: that.data.hour + 1
      })
    }
    that.setData({
      timecount: that.data.hour + ":" + that.data.minute + ":" + that.data.second + '.' + that.data.millisecond
    })
  },

  //输入doing
  inputdoing: function(e) {
    var that=this;
    var iv = e.detail.value.replace("。", ".").replace(",", ".").replace("，", ".")
    var dot = iv.indexOf(".")
    var fv, dv;
    if (dot > 1) {
      fv = iv.substr(0, dot);
      dv = iv.substr(dot + 1);
    }
    else{
      fv="";
      dv=iv;
    }

    var dupl=that.data.doList.filter(function(i){
      return i.status!=2 && i.doing===dv && i.father===fv
    }).length;
    if (dupl>0){
      wx.showToast({
        title: '做什么名称重复',
        image: '../../images/icon_no2.png',
      })
      that.setData({
        doing:"",
        placeHDo:"输入请不要与完成工作重名"
      })
    }
    else{
      that.setData({
        doing:dv,
        father:fv
      })
    }
  },

  needp: function(e) {
    var that = this;
    that.setData({
      needproof: e.detail.value
    })
  },
  
//选择计划工作
  catchdo:function(e){
     var that =this;
     var target = that.data.doList.filter(item => item.doing == e.detail.value)[0];
     if(that.data.start===0 && that.data.doing===""){
       that.setData({
           doing: target.doing,
           father: target.father,
           status: 2,
           needproof: target.needproof,
           standardTime: target.standardTime,
       })
     }
     else{
       wx.showToast({
         title: '完成计划或重来'
       })
     }
   //  console.log("start:"+that.data.start)
    //console.log("startTime:"+that.data.startTime)

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})