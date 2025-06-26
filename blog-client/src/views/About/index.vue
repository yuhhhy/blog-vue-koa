<script setup>
import Sidebar from "@/components/Sidebar/index.vue"
import ArticleFooter from "../Blog/components/ArticleFooter.vue"
</script>

<template>
    <div class="about-cotainer">
        <div class="about">
            <div class="about-article">
                <!-- 内容区域 -->
                <div class="about-article-content">
                    <h2>关于我的小站</h2>
                    <ul style="list-style: none;">
                        <li>
                            <p>这里是<span class="highlight">一曝十寒</span>，一个记录前端踩坑笔记、个人成长反思和偶尔发疯文学的地方。更新频率随缘，但每篇内容都会死磕细节
                            </p>
                        </li>
                        <li>
                            <p>我的名字是<span class="highlight">yuhhhy</span>，你可以叫我小Y、小寒（或者你觉得顺口的称呼，我不介意被叫成任何有趣的名字~）
                            </p>
                        </li>
                    </ul>

                    <h2>关于我</h2>
                    <ul style="list-style: none;">
                        <li><strong>基本信息</strong>：大二学生，江西人，坐标长沙</li>
                    </ul>

                    <ul style="list-style: none;">
                        <li><strong>兴趣爱好</strong>：
                            <ul>
                                <li>音乐：喜欢<span title="含电子元素的我都喜欢">电子音乐</span>、<span
                                        title="喜欢的P主有：久眯、合目、ilem、椎名もた、40mP…">VOCALOID</span>、流行</li>
                                <li>运动：<span title="从小就开始打了">羽毛球</span>、跑步</li>
                                <li>阅读：<span
                                        title="然而并没有读多少">会买很多书</span>，尤其喜欢：《2001太空漫游》、《卡拉马佐夫兄弟》、契诃夫的小说、刘慈欣的小说，近期在看漫画《火之鸟》
                                </li>
                                <li>影视：喜欢的电影有《寄生虫》、《情书》、《花束般的恋爱》，喜欢的番剧有《It's MyGO!!!!!》、<span
                                        title="中文名叫铃音">《Serial Experiments Lain》</span>、《Just Because!》、《龙与虎》</li>
                                <li>游戏：玩过决战平安京、战地5、CS2等</li>
                            </ul>
                        </li>
                    </ul>

                    <ul style="list-style: none;">
                        <li><strong>个人特色/技能</strong>：
                            <ul>
                                <li>关注社会新闻，读过一点<ruby>马<rp>(</rp>
                                        <rt>mǎ</rt>
                                        <rp>)</rp>经<rp>(</rp>
                                        <rt>liè</rt>
                                        <rp>)</rp>
                                    </ruby></li>
                                <li>会弹<ruby>一<rp>(</rp>
                                        <rt>chū</rt>
                                        <rp>)</rp>点<rp>(</rp>
                                        <rt>xué</rt>
                                        <rp>)</rp>点<rp>(</rp>
                                        <rt>zhě</rt>
                                        <rp>)</rp>
                                    </ruby>吉他，研究一点作曲</li>
                            </ul>
                        </li>
                    </ul>

                    <h2>为什么要做这个博客？</h2>
                    <ul style="list-style: none;">
                        <li>
                            <p>大概是在 2024 年中，我开始接触前端开发，学习了 HTML、CSS、JavaScript 等基础知识。随着学习的深入，我发现自己在前端领域的兴趣越来越浓厚，想要有一个属于自己的空间来记录学习过程中的点滴。除了学习以外，我还有更多的想法和感悟，希望能够通过这个博客来表达，或者说是发泄一下自己的情绪。😅
                            </p>
                        </li>
                        <li>
                            <p>而且个人博客是一个相对自由的平台，在博客上我可以记录自己的所学所思所感，方便自己将来的时候回顾，可能会有新的发现。而且博客也不是一个封闭的系统，博客上的内容，可能会被任何方式与他人分享，不论是爬虫、AI获取再输出、还是直接被访问！也许我的某一篇博客在将来的某一个时刻，能对屏幕前的你有一点点作用，那我就很满足了，嘻嘻~😉
                            </p>
                        </li>
                        <li>
                            <p>在建立我的个人博客时，我翻看了许多的博客站点，它们有的坚持一直更新，但也有更多的博客一两年没再更新内容，这让我思考博客的意义。因为我知道我是一个对许多事情都三分钟热度的人，所以我不想让这个称呼一语成谶，而是希望能够做到坚持不懈，我也最钦佩能坚持不懈把一件事一直做下去的人。我知道这不单单需要热情与冲劲，更需要长远的规划。🤔
                            </p>
                        </li>
                        <li>
                            <p>还有一件我意识到的事情是，在互联网这片土地上，有时最珍贵的并不是多么厉害的技术或者知识，而是真实的态度。我希望我的个人博客能够成为一个让我真实地展示自己，或许也与大家分享想法、交流感受的空间！😄
                            </p>
                        </li>
                    </ul>

                    <h2>朋友</h2>
                    <ul>
                        <li><a href="https://v.douyin.com/h-Lzt62UbIQ/ 3@9.com :3pm" target="_blank">25020jason1728</a></li>
                    </ul>
                    <h2>可能对我有启发的博客</h2>
                    <ul>
                        <li><a href="https://idealclover.top/" target="_blank">idealclover</a></li>
                        <li><a href="https://blog.fiveth.cc/" target="_blank">fiveth</a></li>
                    </ul>
                </div>
                <!-- 评论区域 -->
                <ArticleFooter :pageId="'-1'"></ArticleFooter>
                </div>
            <Sidebar class="about-sidebar"></Sidebar>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.about-cotainer {
    padding-top: 64px;
    .about {
        background-color: var(--light);
        padding: 40px calc(7vw + 10px);
        display: flex;
        height: 100%;

        .about-article {
            background-color: var(--white);
            border-radius: 10px;
            flex: 1;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .about-article-content {
                padding: 0 30px;
                line-height: 1.8;
                padding-bottom: 30px;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                color: var(--light-dark);

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

                span {
                    text-decoration: underline var(--lightgrey);
                    cursor: pointer;
                }

                span.highlight {
                    text-decoration: none;
                    cursor: default;
                    color: var(--blue);
                    font-weight: bold;
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

                    &:hover {
                        text-decoration: underline;
                    }
                }
            
            }
        }

        @media (max-width: 768px) {
            padding: 0;
            flex-direction: column;

            .about-article {
                margin-right: 0;
                box-shadow: none;
                border-radius: 0;

                .about-article-content {
                    padding-bottom: 30px;
                    padding-left: 15px;
                    padding-right: 15px;

                    ul {
                        padding-left: 1.5em;
                    }
                }
            }
        }
    }
}
</style>
