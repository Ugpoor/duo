// pages/duo_report/duo_report.js
const repcol = wx.cloud.database().collection("duoscore");
const logcol = wx.cloud.database().collection("duoLog");
var days = [];
var years = [];
var months = [];
var scoreRec = {
  calDay: new Date(), //结算截止日期
  total: 0,
  unused: 0,
  useList: []
}


/*
//结算分数(根据完成时间结算，确保分数都能结算)
function calScore(){
  var sid = getApp().globalData.openid;
  repcol.where({
    _openid:sid
  }).get({
    success:res=>{
      var sr={};
      if(res.data!=[]){
        sr=res.data[0];
        logcol.where({
          end:_gt(cr.calDay),
      }
      else{
        repcol.add({
          data:scoreRec,
          success:res=>{
            repcol.where({_openid:sid}).get({
              success:res=>{
                sr=res.data[0];
              }
            });
          }
        });
      }
    }
  })

  var done=0;
  var todo=0;
  var score=0;
  var unusedScore=0;
  logcol.where({
    today:day
  }).get({
    success:res=>{
      for(var lst in res.data){
        if(lst.status==1){
          done+=1;
        }else if(lst.status==2){
          todo+=1;
        }
      }
    }
  })

}
*/

Page({
  data: {
    calDay: "", //只用于显示
    today: "",
    choice: 0, //0-day,1-doing，搜索方式
    day: "",
    searchDo: "",
    done: 0,
    todo: 0,
    totalScore: 0,
    unUsedScore: 0, //截止到今天开始未使用积分
    useScore: [], //历史使用积分列表
    doList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    //设置回调，防止小程序globalData拿到数据为null    
    getApp().getopenid(res => {
      var sid = res;
      var st = new Date();
      var td = st.toDateString();
      that.setData({
        day: td
      })
      logcol.where({
        _openid: sid,
        status: 1
      }).count().then(res => {
        that.setData({
          today: td,
          done: res.total
        });
      });
      logcol.where({
        _openid: sid,
        status: 2
      }).count().then(res => {
        that.setData({
          todo: res.total
        });
      });

      repcol.where({
        _openid: sid
      }).get({
        success: res => {
          console.log("res:" + JSON.stringify(res))
          if (res.data != []) {
            var sc = res.data[0];

            that.setData({
              calDay: sc.calDay.toDateString(),
              totalScore: sc.total,
              unUsedScore: sc.unused,
              useScore: sc.useList
            });
          }
        }
      })
    })

  },

  /*
    //结算(??-未成功)
    cal: function() {
      getApp().getopenid(res => {
        var sid = res;
        console.log(sid);
        repcol.where({
          _openid: sid
        }).get({
          success: res => {
            var td = new Date();
            var rd = res.data.length;
            if (rd != 0) {
              var sc = res.data[0];
              var uls = sc.useList; //包含{day,score,desc}
              var used = 0;
              for (var ul in uls) {
                used = ul.score + used;
              }

              logcol.where({
                _openid: sid,
                status: 1
              }).get({
                success: res => {
                  var total = 0;
                  for (var t in res.data) {
                    var pr = t.proof;
                    if (pr != {}) {
                      total = total + 1;
                    }
                  };
                  that.setData({
                    calDay: td,
                    totalScore: total,
                    unUsedScore: total - used
                  });
                }
              });

              //更新积分
              repcol.where({
                _openid: sid
              }).update({
                data: {
                  total: total,
                  unused: total - used,
                  calDay: td
                }
              });
            } else {
              console.log("from here");
              logcol.where({
                _openid: sid,
                status: 1
              }).get({
                success: res => {
                  var total = 0;
                  for (var t in res.data) {
                    var pr = t.proof;
                    if (pr != {}) {
                      total = total + pr.score;
                    }
                  };
                  that.setData({
                    calDay: td,
                    totalScore: total,
                    unUsedScore: total - used
                  });
                }
              });
              repcol.add({
                data: {
                  total: total,
                  unused: total - used,
                  calDay: td,
                  useList: []
                },
                success: res => {
                  console.log("score caled");
                }
              })
            };
            console.log('finish');
          }
        });
      });
    },
  */
  //选择radio行为
  catchSearch: function(e) {
    var that = this;
    that.setData({
      choice: e.detail.value
    });
  },

  //搜索
  search: function() {
    var that = this;
    var d = that.data;
    getApp().getopenid(res => {
      console.log("res："+res)
      if (d.choice == 0) {
        console.log("search day:"+d.day+".")
        logcol.where({
          today: d.day,
          _openid: res
        }).get({
          success: res => {
            console.log("get search:" + JSON.stringify(res.data));
            that.setData({
              doList: res.data
            })
          }
        })
      } else {
        console.log("search do:" + d.searchDo + ".")
        logcol.where({
          doing: d.searchDo,
          _openid: res
        }).get({
          success: res => {
            console.log("get search:"+JSON.stringify(res.data));
            that.setData({
              doList: res.data
            })
          }
        })
      }

    })
  },

  //搜索日期
  bindDateChange:function(e){
    var that=this;
    var dv=e.detail.value.split("-");
    var dt = new Date(parseInt(dv[0]), parseInt(dv[1]) -1,parseInt(dv[2]));
    that.setData({
      day:dt.toDateString()
    })
  },

  //搜索做什么
  searchdo:function(e){
    var that = this;
    that.setData({
      searchDo:e.detail.value
    })
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