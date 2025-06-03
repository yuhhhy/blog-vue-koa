<script setup>
import ArticleFooter from "../Blog/components/ArticleFooter.vue"
import { ElMessage } from 'element-plus'

// 复制内容到剪贴板
const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${type}已复制`)
}
</script>

<template>
    <div class="links">
        <div class="links-article">
            <!-- 内容区域 -->
            <div class="links-article-content">

                <h1>友链</h1>

                <!-- 友链区域，覆盖掉基础的Blog HTML样式 -->
                <div class="links-display">
                    <!-- 一条友链 -->
                    <div class="link-item" v-for="item in 4">
                        <div class="link-avatar">
                            <img src="@/assets/images/linkicon.png" alt="link-avatar">
                        </div>
                        <div class="link-info">
                            <div class="link-title">idealclover</div>
                            <div class="link-motto">Stay simple, stay naive.</div>
                        </div>
                    </div><div class="link-item" v-for="item in 4">
                        <div class="link-avatar">
                            <img src="https://bu.dusays.com/2024/10/25/671b2438203a6.gif" alt="link-avatar">
                        </div>
                        <div class="link-info">
                            <div class="link-title">维基萌</div>
                            <div class="link-motto">萌即是正义！时不时分享一些 ACG 活动记录与有趣代码的小站！</div>
                        </div>
                    </div>
                </div>

                <h2>友链申请规则</h2>
                    <ul>
                        <li>✅您的网站在中国大陆区域能够正常访问</li>
                        <li>✅您的网站需要有可读的内容</li>
                        <li>✅麻烦先为您的网站添加本站友链</li>
                        <li>✅我会根据内容质量添加友链~谢谢🎉</li>
                    </ul>
                    <p>友链格式与本站信息如下：</p>
                <pre><code>
    <span>名称: </span><span>"一曝十寒"</span>
    <span>描述: </span><span>"你好"</span>
    <span>地址: </span><span>"https://www.yuhhhy.cn"</span>
    <span>头像: </span><span>"https://image.example.com/avatar.jpg"</span>
                </code></pre>

                <h2>申请方式</h2>
                    <ol>
                        <li>在当前页面评论区评论👇</li>
                        <li>或者你也可以给<a href="javascript:void(0)" @click="copyToClipboard('yuhhhy109@163.com', '邮箱')">我的邮箱✉️</a>发送邮件</li>
                    </ol>
                    
            </div>
            <!-- 评论区域 -->
            <ArticleFooter :pageId="'0'"></ArticleFooter>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.links {
    background-color: var(--light);
    margin-top: 64px;
    padding: 40px calc(17vw + 10px);
    display: flex;
    height: 100%;

    .links-article {
        background-color: var(--white);
        border-radius: 10px;
        flex: 1;

        .links-article-content {
            padding: 0 30px 30px 30px;
            line-height: 1.8;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: var(--light-dark);

            .links-display {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                
                .link-item {
                    border-radius: 8px;
                    background-color: var(--links-background);
                    display: flex;
                    flex-direction: row;

                    .link-avatar {
                        background: linear-gradient(to right, var(--white), var(--links-background));
                        height: 75px;
                        width: 75px;

                        img {
                            border-radius: 50%;
                            height: 75px;
                            width: 75px;
                        }
                    }

                    .link-info {
                        padding-left: 15px;

                        .link-title {
                            font-size: 1.1rem;
                            font-weight: bold;
                            margin-bottom: 0.1em;
                        }
                        .link-motto {
                            color: var(--light-dark);
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            line-clamp: 2;  // 限制显示两行，多余部分用省略号
                            -webkit-box-orient: vertical;
                            line-height: 1.3;
                        }

                    }

                }

            }

            h1 {
                font-size: 2em;
            }

            h2 {
                font-size: 1.8em;
            }

            h3 {
                font-size: 1.6em;
            }

            h4 {
                font-size: 1.4em;
            }

            h5 {
                font-size: 1.2em;
            }

            h6 {
                font-size: 1em;
            }

            h1, h2, h3, h4, h5, h6 
            {
                color: var(--blue);
                margin: 1.5em 0 0.8em;
                font-weight: 600;

                a {
                    display: none;
                }

                &:hover {
                    a {
                        display: inline;
                    }
                }
            }

            p {
                margin-bottom: 1.2em;
                font-size: 1rem;
            }

            p[align="center"] {
                font-size: 0.8rem;
                color: var(--quote-color);
            }

            ul, ol {
                padding-left: 2em;
                margin: 1em 0;

                li {
                    margin-bottom: 0.6em;
                    list-style-position: outside;
                }
            }

            a {
                color: var(--skyblue);
                text-decoration: none;
                word-break: break-word; // 文字折行
            }

            pre {
                background: var(--code-background);
                padding: 0;
                border-radius: 5px;
                overflow-x: auto;

                code {
                    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
                    color: var(--code-color);
                    background: none;
                    padding: 0;
                    border-radius: 0;
                }
            }
        
        }
    }
    @media (max-width: 768px) {
        padding: 0;
        flex-direction: column;

        .links-article {
            margin-right: 0;
            margin-bottom: 20px;

            .links-article-content {
                padding-bottom: 30px;
                padding-left: 30px;
                padding-right: 30px;

                .links-display {
                    grid-template-columns: repeat(1, 1fr);
                }

                h1, h2, h3, h4 
                {
                    font-size: 20px;
                }

                p, ul, ol, li, code, pre, blockquote 
                {
                    font-size: 14px;
                }
            }
        }
    }
}
</style>
