<script setup>
import Sidebar from "@/components/Sidebar/index.vue"
import ArticleFooter from "../Blog/components/ArticleFooter.vue"
</script>

<template>
    <div class="about">
        <div class="about-article">
            <!-- 内容区域 -->
            <div class="about-article-content">
                <h1>关于我</h1>
                <ul>
                    <li><strong>基本信息</strong>：大二学生，江西人，坐标长沙</li>
                </ul>

                <ul>
                    <li><strong>兴趣爱好</strong>：
                        <ul>
                            <li><strong>音乐</strong>：喜欢<span title="含电子元素的我都喜欢">电子音乐</span>、<span
                                    title="喜欢的P主有：久眯、合目、ilem、椎名もた、40mP…">VOCALOID</span>、流行</li>
                            <li><strong>运动</strong>：<span title="从小就开始打了">羽毛球</span>、跑步</li>
                            <li><strong>阅读</strong>：<span
                                    title="然而并没有读多少">会买很多书</span>，尤其喜欢：《2001太空漫游》、《卡拉马佐夫兄弟》、契诃夫的小说、刘慈欣的小说，近期在看漫画《火之鸟》
                            </li>
                            <li><strong>影视</strong>：喜欢的电影有《寄生虫》、《情书》、《花束般的恋爱》，喜欢的番剧有《It's MyGO!!!!!》、<span
                                    title="中文名叫铃音">《Serial Experiments Lain》</span>、《Just Because!》、《龙与虎》</li>
                            <li><strong>游戏</strong>：玩过决战平安京、战地5、CS2等</li>
                        </ul>
                    </li>
                </ul>

                <ul>
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

                <h1>为什么要做这个博客？</h1>
                <ul style="list-style: none;">
                    <li>
                        <p>个人博客是一个相对自由的平台，在博客上我可以记录自己的所学所思所感，方便自己将来的时候回顾，可能会有新的发现。而且博客也不是一个封闭的系统，博客上的内容，可能会被任何方式与他人分享，不论是爬虫、AI获取再输出、还是直接被访问！也许我的某一篇博客在将来的某一个时刻，能对屏幕前的你有一点点作用，那我就很满足了（如果有人来看我的话，你好呀(*´▽｀)ノ）😉
                        </p>
                    </li>
                    <li>
                        <p>在建立我的个人博客时，我翻看了许多的博客站点，它们有的坚持一直更新，但也有更多的博客一两年没再更新内容，这让我思考博客的意义。因为我知道我是一个对许多事情都三分钟热度的人（我们名字“一曝十寒”大概也因此而起），所以我不想让这个称呼一语成谶，而是希望能够做到坚持不懈，我也最钦佩能坚持不懈把一件事一直做下去的人。我知道这不单单需要热情与冲劲，更需要长远的规划。🤔
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
                <h3>可能对我有启发的博客</h3>
                <ul>
                    <li><a href="https://idealclover.top/" target="_blank">idealclover</a></li>
                    <li><a href="https://blog.fiveth.cc/" target="_blank">fiveth</a></li>
                    <li><a href="https://liuyuyang.net/" target="_blank">liuyuyang</a></li>
                </ul>
            </div>
            <!-- 评论区域 -->
            <ArticleFooter :pageId="'-1'"></ArticleFooter>
        </div>
        <Sidebar class="about-sidebar"></Sidebar>
    </div>
</template>

<style lang="scss" scoped>
.about {
    background-color: var(--light);
    margin-top: 64px;
    padding: 40px calc(7vw + 10px);
    display: flex;
    height: 100%;

    .about-article {
        background-color: var(--white);
        border-radius: 10px;
        flex: 1;

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

        .about-aritcle {
            margin-right: 0;
            margin-bottom: 20px;

            .about-article-content {
                padding-bottom: 30px;
                padding-left: 15px;
                padding-right: 15px;

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
