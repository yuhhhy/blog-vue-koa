import nodemailer from "nodemailer"
import { getFormatDateToMinutes } from './date.js'

// 邮箱SMTP服务授权码，180天过期
const pass = 'HWy7awaknmdttr7Y'

const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,                 // 安全端口（SSL）
    secure: true,              // 使用 SSL 加密
    auth: {
        user: 'yuhhhy109@163.com',
        pass
    }
})

export async function sendEmail(data) {
    try {
        const {
            blogTitle,
            blogLink,
            username,
            commentTime,
            commentContent,
            commentEmail,
            replyTime,
            replyUsername,
            replyContent
        } = data

        const mailOptions = {
            from: '"yuhhhy的个人博客" <yuhhhy109@163.com>', // 发件人（必须和 auth.user 一致）
            to: `${commentEmail}`,             // 收件人邮箱
            subject: `您在 '${blogTitle}' 上的评论有新的回复`,
            html:
                `
            <div style="max-width: 750px; margin: 30px auto; background-color: #fff; border-radius: 4px; box-shadow: 0 5px 15px rgba(36, 106, 215, 0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #64afff, #71ecff); color: white; padding: 15px 25px; font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">
                    Dear ${username},
                </div>
                <div style="padding: 25px 30px 0 30px;">
                    <div style="margin-bottom: 25px;">
                        <p style="font-size: 15px; margin: 0 0 18px 0; padding-bottom: 30px; border-bottom: 1px solid #e1e8f7; color: #445;">
                            您在<a href="${blogLink}" target="_blank" style="color: #3b6ca8; text-decoration: none;">${blogTitle}</a>上的评论有新回复啦！
                        </p>
        
                        <div style="color: #667; font-size: 14px; background-color: #f7f9ff; border-left: 3px solid #d9e4f5; padding: 12px 18px; margin: 35px 0 15px 0; border-radius: 0 6px 6px 0;">
                            <p style="margin: 0 0 8px 0;">您的评论发布于：<span style="color: #445; font-weight: 500;">${getFormatDateToMinutes(commentTime)}</span></p>
                            <div style="height: 1px; background: linear-gradient(to right, #d9e4f5, transparent); margin: 10px 0;"></div>
                            <p style="margin: 8px 0 0 0; line-height: 1.6; color: #445;">
                                ${commentContent}
                            </p>
                        </div>
                    </div>
                    <div style="margin: 30px 0;">
                        <p style="color: #667; font-size: 14px; margin: 0 0 8px 0;">
                            <span style="color: #5489cb; font-weight: 500;">${replyUsername}</span> 回复于：<span style="color: #445; font-weight: 500;">${getFormatDateToMinutes(replyTime)}</span>
                        </p>
                        <div style="color: #667; font-size: 14px; background-color: #f7f9ff; border-left: 3px solid #d9e4f5; padding: 12px 18px; margin: 15px 0; border-radius: 0 6px 6px 0;">
                            <p style="margin: 0; line-height: 1.6; color: #445;">
                              ${replyContent}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: center; margin: 35px 0 25px 0;">
                        <a href="${blogLink}" target="_blank" style="display: inline-block; background-color: #64afff; color: white; padding: 8px 24px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 400; letter-spacing: 0.3px;">
                            跳转至网站以查看完整信息
                        </a>
                    </div>
                    <div style="text-align: center; color: #889; font-size: 13px; margin-top: 10px; border-top: 1px solid #e1e8f7;">
                        <p>此为系统自动推送，不可能不发</p>
                        <p>©2025 一曝十寒</p>
                    </div>
                </div>
            </div>
          `
        }
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error('发送邮件失败:', error)
    }
}