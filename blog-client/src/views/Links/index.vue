<script setup>
import ArticleFooter from "../Blog/components/ArticleFooter.vue"
import { getLinks } from "@/api/links.js"
import { ref, onMounted } from "vue"

const links = ref([])

onMounted(async () => {
    const res = await getLinks()
    links.value = res
})

</script>

<template>
<div class="link-container">
    <div class="links">
        <div class="links-article">
            <!-- 内容区域 -->
            <div class="links-article-content">

                <h1>介绍语</h1>
                <p>很高兴在网络世界的角落里遇见你！这个小小的友链空间，是我用来存放那些在浩瀚信息流中打动过我、带给我灵感或共鸣的地方。</p>
                <p>我珍视真诚的分享、独特的见解和持续创作的坚持。如果你也建立了一个小小的精神角落，记录生活、表达思考、分享热爱，并且你觉得我们有某种契合，欢迎留言和互加友链。</p>
                <p>我会认真拜访你的“空间”，如果感觉有缘分，就会将你加入我的友链列表。即使暂时不互相加为友链，也期待与你成为朋友或交流想法！感谢每一位愿意分享小站的朋友！</p>

                <h1>朋友们</h1>
                <p>以下是目前与我互相陪伴的站点，点击头像即可探索他们的世界🚀 如果你也想出现在这里，请继续往下看规则~</p>
                <!-- 友链展示区域 -->
                <div class="links-display">
                    <!-- 一条友链 -->
                    <div class="link-item" v-for="link in links">
                        <div class="link-avatar">
                            <a :href="link.site" target="_blank">
                                <img :src="link.avatar" alt="link-avatar">
                            </a>
                        </div>
                        <div class="link-info">
                            <a :href="link.site" target="_blank" style="color: var(--light-dark);">
                                <div class="link-title">{{ link.name }}</div>

                            </a>
                            <div class="link-motto">{{ link.description }}</div>
                        </div>
                    </div>
                </div>

                <h2>友链申请规则</h2>
                <ul>
                    <li>✅您的网站在中国大陆区域能够正常访问（如果使用海外服务器，建议启用CDN加速）</li>
                    <li>✅您的网站需要需与我的博客主题有一定关联性（如前端技术、个人成长、生活记录），或更新稳定</li>
                    <li>✅麻烦先为您的网站添加本站友链</li>
                    <li>✅我会根据内容质量添加友链~谢谢</li>
                    <li>❌不接受纯商业推广、采集站、或包含敏感内容的站点</li>
                </ul>

                <p>友链申请格式与本站信息如下：</p>
                <pre><code>
    <span>名称: </span><span>"一曝十寒"</span>
    <span>简介: </span><span>"纵使不安彷徨，即便茫然无措，也依然迈步前行"</span>
    <span>网站: </span><span>"https://yuhhhy.cn/"</span>
    <span>头像: </span><span>"https://yuhhhy.cn/images/avatar.jpg"</span>
                </code></pre>

                <h2>申请方式</h2>
                <ol>
                    <li>在当前页面评论区评论</li>
                    <address>
                        <li>或者你也可以给我的邮箱✉️<a href="mailto:yuhhhy109@163.com">yuhhhy109@163.com</a>发送邮件</li>
                    </address>
                </ol>
            </div>
            <!-- 评论区域 -->
            <ArticleFooter :pageId="'0'"></ArticleFooter>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
.link-container {
    background-color: var(--white);
    
    .links {
        background-color: var(--light);
        padding: 40px calc(17vw + 10px);
        display: flex;
        height: 100%;

        .links-article {
            background-color: var(--white);
            border-radius: 10px;
            flex: 1;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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
                                min-width: 75px;
                                margin: 0;

                                // 旋转效果，离开时反向
                                &:hover {
                                    transform: rotate(720deg);
                                    transition: transform 0.5s ease-in-out;
                                }
                                transition: transform 0.5s ease-in-out;
                            }
                        }

                        .link-info {
                            padding-left: 15px;

                            .link-title {
                                font-size: 1.1rem;
                                font-weight: bold;
                                margin-bottom: 0.1em;
                                &:hover {
                                    color: var(--blue);
                                }
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
                        color: var(--light-dark);
                        background: none;
                        padding: 0;
                        border-radius: 0;
                    }
                }

                address {
                    font-style: normal;
                }
            }
        }
        @media (max-width: 768px) {
            padding: 0;
            flex-direction: column;

            .links-article {
                margin-right: 0;
                box-shadow: none;
                border-radius: 0;

                .links-article-content {
                    padding-bottom: 30px;
                    padding-left: 30px;
                    padding-right: 30px;

                    .links-display {
                        grid-template-columns: repeat(1, 1fr);
                    }
                }
            }
        }
    }
}
</style>
