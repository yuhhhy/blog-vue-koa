import Mock from 'mockjs'

Mock.mock('/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body)
    if (username === 'admin' && password === '123456') {
        return {
            success: "true",
            message: "跳转到首页",
            username: "admin",
            userid: "0001",
            code: 200
        }
    } else {
        return {
            success: "false",
            message: "用户名或密码错误",
            code: 403
        }
    }
})
