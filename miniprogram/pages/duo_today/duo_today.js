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
      needproof:false
    });

    logcol.where({
      today: td
    }).get({
      success: function(res) {
        var dl = res.data;
        var dlol = dl.length;
        var tdl;

        //添加计划任务
        todocol.get({
          success: function (res) {
             tdl = res.data;
           

            
            //为何进不了循环体(for 循环有错 )
            for(d of tdl){
              /*
              var d=tdl[i];
              console.log("d:" + Json.stringify(d));
             
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
                proof: {},
                owner: getApp().globalData.openid,
                standardTime: d.standardTime,
                lateStandard: ""
              };
              dl.push(task);
              console.log("tasklength:" + dl.length);
              */
            }
            console.log("tdl:" + JSON.stringify(tdl));
          }
        }) ;
        
        if (dlol=== 0) {
          wx.showToast({
            icon: 'loading',
            title: '新的一天开始了'
          })
          that.setData({
            today: td
          })
        };


      //  console.log("dl："+JSON.stringify(dl));
        that.setData({
          doList: dl
        })
      }
    });

  },

  /*
  //若加入挂起，判断新的一天的计算逻辑
      logcol.where({today:td}).get({
        success:function(res){
          var dl=res.data
          var hangl=logcol.where(_.and([
            {
              today: _.not(_.eq(td))
            },
            {
              status: _.eq(0)
            }
          ])).get()

          if (dl.length===0){
            wx.showToast({
              icon: 'loading',
              title: '新的一天开始了'
            })
            that.setData({
              today: td,
              doList: hangl
            })
          }
          else{
            that.setData({
              doList: dl.concat(hangl)
            })
          }
        }
      })
      
    },
    */

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
          istiming: true
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
      proof: {},
    })
    clearInterval(intt);
  },

  //完成
  finish: function() {
    var that = this;
    var st = new Date();
    var td = st.toDateString();
    var task = {
      id: that.data._id,
      today: that.data.today,
      startTime: that.data.startTime,
      timecount: that.data.timecount,
      start: that.data.start,
      end: st,
      doing: that.data.doing,
      father: that.data.father,
      label: that.data.label,
      status: 1,
      istiming: false,
      proof: that.data.proof,
      needproof:that.data.needproof,
      owner: getApp().globalData.openid,
      standardTime: "",
      lateStandard:"",
    };

    if (that.data.doing != "" && that.data.start != 0) {
      logcol.add({
        data: task,
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          clearInterval(intt);

          //清除今日计划
          deli = function () {
            if (that.data.status === 2) {
              var dlist = that.data.doList;
              for (var i = 0; i < dlist.length; i++) {
                if (dlist[i].doing === that.data.doing) return i;
              }
            }
          }
          if (deli > -1) {
            that.data.doList.splice(deli, 1);
          }

          this.setData(logData);
          wx.showToast({
            title: '工作记录提交成功'
          })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)

          logcol.where({
            today: td
          }).get({
            success: function(res) {
              var dl = res.data
              if (dl.length === 0) {
                wx.showToast({
                  icon: 'loading',
                  title: '新的一天开始了'
                })
                that.setData({
                  today: td
                })

                todocol.get({
                  success: function (res) {
                    var tdl = res.data
                    var tl = []
                    for (let d of tdl) {
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
                        proof: {},
                        owner: getApp().globalData.openid,
                        standardTime: d.standardTime,
                        lateStandard: "",
                      };
                      tl.push(task);
                    }
                    that.setData({
                      doList: tl
                    })
                  }
                })
              } else {
                that.setData({
                  doList: dl
                })
              }
            }
          })

       

          /*
          logcol.where({ today: td }).get({
            success: function (res) {
              var dl = res.data
              var hangl = logcol.where(_.and([
                {
                  today: _.not(_.eq(td))
                },
                {
                  status: _.eq(0)
                }
              ])).get()

              if (dl.length === 0) {
                wx.showToast({
                  icon: 'loading',
                  title: '新的一天开始了'
                })
                that.setData({
                  today: td,
                  doList: hangl
                })
              }
              else {
                that.setData({
                  doList: dl.concat(hangl)
                })
              }
            }
          })*/
        }
      })
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

  /*
  //挂起工作
    hang:function(e){
      var that = this;
      var st = new Date();
      var td = st.toDateString();
      if (that.data.doing != "" && that.data.start != 0) {
        logcol.add({
          data: {
            today: that.data.today,
            startTime: that.data.startTime,
            timecount: that.data.timecount,
            start: that.data.start,
            end: st,
            doing: that.data.doing,
            father: that.data.father,
            label: that.data.label,
            status: 0,
            istiming: false,
            proof: that.data.proof,
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            clearInterval(intt);
            this.setData(logData);
            wx.showToast({
              title: '挂起工作成功，注意挂起的工作会继续计时'
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            logcol.where({ today: td }).get({
              success: function (res) {
                var dl = res.data
                var hangl = logcol.where(_.and([
                  {
                    today: _.not(_.eq(td))
                  },
                  {
                    status: _.eq(0)
                  }
                ])).get()

                if (dl.length === 0) {
                  wx.showToast({
                    icon: 'loading',
                    title: '新的一天开始了'
                  })
                  that.setData({
                    today: td,
                    doList: hangl
                  })
                }
                else {
                  that.setData({
                    doList: dl.concat(hangl)
                  })
                }
              }
            })
          },
          fail: err => {
            wx.showToast({
              title: '挂起工作提交失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
      }
      else {
        wx.showToast({
          title: '请完成事件时间记录才进行挂起。',
          image: '../../images/icon_no2.png'
        })
      }
    },
    */

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
    var iv = e.detail.value.replace("。", ".").replace(",", ".").replace("，", ".")
    var that=this;
    if(iv in that.data.doList)
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


  needp: function(e) {
    var that = this;
    that.setData({
      needproof: e.detail.value
    })
  },
  /*
    //完成工作挂起点击--恢复进入主计时器。
    catchhang:function(e){
      var that = this;
      var st = new Date();
    },

  //完成工作点击--增加父任务的子任务
    catchDone:function(e){
      var that=this;
      var st = new Date();

      //如果正在记录则挂起
      if (that.data.istiming){
        logcol.add({
          data: {
            today: that.data.today,
            startTime: that.data.startTime,
            timecount: that.data.timecount,
            start: that.data.start,
            end: st,
            doing: that.data.doing,
            father: that.data.father,
            label: that.data.label,
            status: 0,
            istiming: false,
            proof: that.data.proof,
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            clearInterval(intt);
            this.setData(logData);
            wx.showToast({
              title: '任务成功挂起'
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            wx.showToast({
              title: '任务挂起失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
        that.setData({
          father:e.currentTarget.data.father===''?e.currentTarget.data.doing:e.currentTarget.data.father
        });
      }
      else{

      }
    },
    */

  
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