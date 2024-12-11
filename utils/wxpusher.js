const axios = require("axios");

const sendWxMsg = (msg, config) => {
  const getAllUsers = (page = 1, allUsers = []) => {
    // 获取当前页的用户数据
    axios.get("https://wxpusher.zjiecode.com/api/fun/wxuser/v2", {
      params: {
        appToken: config.wxPusherAppToken,
        page,
        pageSize: 100, // 默认每页最多获取100条用户数据
      }
    })
      .then((userListResponse) => {
        if (!userListResponse.data.success) {
          console.error('获取用户数据失败:', userListResponse.data.msg);
          return;
        }

        // 提取当前页用户的uid并添加到allUsers
        const users = userListResponse.data.data.records;
        allUsers = allUsers.concat(users.map(user => user.uid));

        // 判断是否还有更多页面
        const total = userListResponse.data.data.total;
        const pageSize = userListResponse.data.data.pageSize; // 从响应中提取 pageSize
        if (allUsers.length < total) {
          // 如果没有获取完所有用户，继续请求下一页
          getAllUsers(page + 1, allUsers);
        } else {
          // 获取到所有用户后，发送消息
          sendMessageToUsers(allUsers, msg, config);
        }
      })
      .catch((_error) => {
        console.error('获取用户数据失败');
      });
  };

  const sendMessageToUsers = (userUids, msg, config) => {
    if (userUids.length === 0) {
      console.info('没有用户需要发送消息');
      return;
    }

    // 构建消息内容
    const payload = {
      content: msg,
      summary: "校友邦每日签到",
      contentType: 1, // 1 代表纯文本, 2 代表 HTML, 3 代表 Markdown
      appToken: config.wxPusherAppToken,
      uids: userUids, // 将提取到的所有用户的uid加入
    };

    // 发送消息
    axios.post("https://wxpusher.zjiecode.com/api/send/message", payload, {
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        // console.debug(response.data);
        console.info('WxPusher 消息发送成功');
      })
      .catch((_error) => {
        console.error('WxPusher 消息发送失败');
      });
  };

  // 开始获取用户列表
  getAllUsers();
};

module.exports = { sendWxMsg };

