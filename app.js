const ajax=require("./utils/server.js")
var cryptojs = require("./CryptoJS.js");
App({
  onLaunch: function() {
    this.getOpenid();
    // // 展示本地存储能力

    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  setUserInfo(res) {
    console.log(res)
    this.globalData.userInfo = res;
    this.globalData.isLogin=1;
    this.getOpenid();
  },
  showErrorModal: function (content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      confirmColor: '#ff5722',
      success: function (res) {
        callback && (callback(res));
      }
    })
  },
  timeFormat: function (time, params) {
    var d = time ? new Date(time) : new Date(),
      year = d.getFullYear(),
      month = d.getMonth() + 1,
      day = d.getDate(),
      hours = d.getHours(),
      minutes = d.getMinutes(),
      seconds = d.getSeconds();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    if (params) {
      return {
        year: year,
        month: month,
        day: day
      };
    } else {
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds);
    }
  },
  md5Data: function (oldData) {
    var data = JSON.parse(JSON.stringify(oldData || {})) //保存原始数据
    data = data || {};
    data.timestamp = this.timeFormat();
    var keys = [];
    for (var k in data) {
      if (data[k] === 0 || data[k] === false || data[k]) {
        keys.push(k);
      } else {
        delete data[k];
      }
    }
    keys = keys.sort(function (a, b) {
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1
    });
    var signStr = '';
    for (var i = 0; i < keys.length; i++) {
      signStr += keys[i].toLowerCase() + data[keys[i]];
    }
    data.sign = cryptojs.MD5(signStr + 'hastu6kjyk').toString();
    return data;
  },
  //合并两个数组并去重 
  mergeArray: function (arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
      for (var j = 0; j < arr2.length; j++) {
        if (arr1[i] === arr2[j]) {
          arr1.splice(i, 1); //利用splice函数删除元素，从第i个位置，截取长度为1的元素
        }
      }
    }
    //alert(arr1.length)
    for (var i = 0; i < arr2.length; i++) {
      arr1.push(arr2[i]);
    }
    return arr1;
  },
  //从数组中删除指定值元素
  removeByValue: function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
    return arr;
  },
  getOpenid() {
    const _this=this;
    wx.login({
      success: function(res) {
        wx.hideLoading();
        if (res.code) {
          wx.showLoading({
            title: '加载数据中',
          })
          ajax({
            data: {
              appid: _this.globalData.appId,
              secret: _this.globalData.secret,
              js_code: res.code,
            },
            type: "POST",
            action:  "/index/getOpenid",
            success: function(rs) {
              if(rs.data.code==18){
                return wx.showModal({
                  title: '错误提示',
                  content: rs.data.sub_msg,
                  showCancel:false
                })
              } 
              _this.globalData.openId=rs.data.openid;
              ajax({
                data: {
                  openId: rs.data.openid
                },
                type: "POST",
                action: "/index/getUserInfo",
                success: function (result) {
                  if (result.data.data == '暂未注册') {
                    _this.globalData.isLogin = 0;
                  } else {
                    _this.globalData.isLogin = 1;
                    _this.globalData.userInfo = result.data.userInfo;
                  }
                  wx.hideLoading();
                  wx.navigateBack({

                  })


                }
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg);
        }
      },
      fail(err){
        wx.showModal({
          title: '错误',
          content: JSON.stringify(err),
        })
      }
    })
  },
  globalData: {
    userInfo: null,
    appId: "wx253ee61add52ef25",
    secret: "7f5ddef4b992c8b98a6f23ec93b309b9",
    api:"https://xh.e-duer.com/index.php/api",
    // api:"https://api.szsjkjgs.com/api",
    isLogin:0
  }
})