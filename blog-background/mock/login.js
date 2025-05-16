import Mock from 'mockjs'

Mock.mock('/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body)
    if (username === 'admin' && password === '123456') {
        return {
            data: {
                success: "true",
                username: "admin",
                userid: "0001"
            },
            code: 200,
            message: "登录成功"
        }
    } else {
        return {
            data: {
                success: "false",
            },
            code: 403,
            message: "用户名或密码错误"
        }
    }
})
