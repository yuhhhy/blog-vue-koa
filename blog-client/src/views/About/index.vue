<script setup>
import ArticleFooter from "../Blog/components/ArticleFooter.vue"

defineProps({
    preview: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <div class="about-cotainer">
        <div class="about">
            <header class="page-heading">
                <p>ABOUT</p>
                <h1>关于</h1>
            </header>
            <div class="about-article">
                <!-- 内容区域 -->
                <div class="about-article-content">
                    <nav class="about-social" aria-label="关注与联系">
                        <a href="/feed" target="_blank" rel="noopener noreferrer" aria-label="RSS" title="RSS">
                            <svg viewBox="0 0 1024 1024" aria-hidden="true">
                                <path d="M277.48 862.169c0 53.59-43.44 97.03-97.03 97.03s-97.04-43.44-97.04-97.03 43.44-97.03 97.03-97.03 97.04 43.44 97.03 97.03z m-78.26-797.41c-29.33-3.57-58.8 5.53-80.99 25.04a101.35 101.35 0 0 0-34.43 75.9c0.65 51.8 39.7 95.05 91.17 100.95 286.8 36.39 528.22 295.41 561.08 602.55 5.25 51.46 48.83 90.46 100.56 89.99 29.77 0.45 58.29-11.96 78.25-34.05a98.961 98.961 0 0 0 25.04-78.25c-44.21-396.75-361.93-733.63-740.68-780.98v-1.15z m6.65 334.15c-29.07-6.84-59.66.1-82.95 18.78a102.547 102.547 0 0 0-39.13 81c-.22 47.06 32.34 87.92 78.25 98.21 117.38 28.17 219.11 143.2 244.94 278.97 9.39 46.99 50.3 81.05 98.21 81.78 30.24-.07 58.9-13.53 78.25-36.78a98.616 98.616 0 0 0 21.52-81.78c-39.91-211.67-204.24-393.23-399.1-439.4v-.78z" />
                                <path d="M119.01 937.289l135.77-135.77a95.832 95.832 0 0 1 22.69 61.43c0 53.59-43.44 97.03-97.04 97.03a95.88 95.88 0 0 1-61.42-22.69z m449.18-449.18a704.262 704.262 0 0 1 167.46 381.88c5.25 51.46 48.83 90.46 100.56 89.99 29.77.47 58.3-11.94 78.25-34.05a99.009 99.009 0 0 0 25.04-78.25 905.773 905.773 0 0 0-226.55-504.35l-144.76 144.78z m-162.77 388.92c9.39 46.99 50.3 81.05 98.21 81.78 30.24-.06 58.91-13.53 78.25-36.78 19.1-22.64 27-52.67 21.52-81.78a586.957 586.957 0 0 0-125.6-263.72l-143.99 143.99a384.029 384.029 0 0 1 71.61 156.51z" />
                            </svg>
                        </a>
                        <a href="https://github.com/yuhhhy" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                        </a>
                        <a href="mailto:yuhhhy109@163.com" aria-label="发送邮件" title="发送邮件">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 4h16a2 2 0 0 1 2 2v.5l-10 7-10-7V6a2 2 0 0 1 2-2Zm-2 5 9.4 6.58a1 1 0 0 0 1.2 0L22 9v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" />
                            </svg>
                        </a>
                    </nav>
                    <h4>关于我</h4>
                    <p>这里是<span class="highlight">一曝十寒</span>的个人博客。</p>

                    <p>我是一名 00 后，男，INTP，目前在做前端开发。比起给自己贴上很多标签，我更愿意把自己看成一个对世界保持好奇的人。</p>

                    <p>我喜欢计算机和音乐，也会对诗歌、文学、历史、马克思、游戏、美景，以及各种好吃的东西感兴趣。我的兴趣有些杂，热情也常常来得很快，消退得也很快，所以给自己取了“一曝十寒”这个名字。</p>

                    <p>它有一点自嘲，也像是在提醒自己：我可能总是在很多事情之间摇摆，可能会半途而废，可能会突然对一件事失去兴趣，但那些曾经认真喜欢过的东西，并不会因此毫无意义。我还是想尽量把它们留下来，哪怕只是一段文字、一首歌、一点想法，或者某个很普通的下午。</p>

                    <p>我喜欢音乐，喜欢 Vocaloid，喜欢椎名もた，也喜欢久眯、nakano4、whoo、鱼韵、摇滚和电子乐。它们带给我的感受很难用几个简单的词概括：有时像是在触碰一段说不清的记忆，有时让我意识到孤独、痛苦与希望可以同时存在，也会在某个不经意的瞬间，让我重新感受到世界的辽阔和生命本身的重量。音乐就好像一道光，它让我相信，美好的东西始终存在。</p>

                    <p>也许正因为曾被像这样照亮过，我才会想把生活中那些稍纵即逝的感受记录下来，留给以后的自己，也期待它们偶尔能够抵达另一个人。</p>

                    <h4>为什么做这个博客？</h4>
                    <p>大概从 2024 年开始，我接触了前端开发，学习 HTML、CSS、JavaScript，以及后来遇到的各种框架、工具和工程问题。</p>

                    <p>刚开始的时候，我以为前端只是把页面做出来。学习得越久，越发现它还和设计、交互、工程化以及表达有关。一个页面不只是代码的组合，它也可以承载一个人的审美、习惯和想法。</p>

                    <p>所以我想拥有一个真正属于自己的地方。</p>

                    <p>我曾经使用过语雀、掘金等平台。它们很方便，有成熟的编辑器、社区和流量，但用久以后，我总觉得还缺少一些东西：文章应该怎样排列，页面应该是什么样子，内容应该如何保存，以及这个地方到底有没有属于自己的气质。</p>

                    <p>于是我开始做这个博客。</p>

                    <p>这里会记录我的前端学习、踩坑笔记，也会记录一些成长过程中的反思，以及偶尔不太严肃的想法。它不一定总是更新，也不一定每篇文章都足够完整，但我希望这里能够保留一些真实的东西。</p>

                    <p>我希望未来的自己回头看时，可以知道自己曾经学过什么、困惑过什么、热爱过什么，又是怎样慢慢走到现在的。</p>

                    <p>当然，我也希望这些文字能够被别人看到。</p>

                    <p>在浩瀚的互联网里，两个原本毫无关系的人，因为一篇文章、一首歌，或者一个偶然的搜索结果短暂相遇，本身就是一件很浪漫的事。如果这里的某一篇文章，曾经对屏幕前的你有一点帮助，或者让你产生过一点共鸣，那对我来说就已经足够了。</p>

                    <p>这个博客也许会经历停更、重写和反复修改，但我想把它当成一次长期练习：练习学习，练习表达，练习维护一件并不总能立刻得到回报的事情。</p>

                    <p>希望它最后不只是一个存放文章的地方，也能成为我与世界保持联系的一种方式。</p>

                </div>
                <!-- 评论区域 -->
                <ArticleFooter v-if="!preview" :pageId="'-1'"></ArticleFooter>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.about-cotainer {
    background-color: transparent;
    min-height: calc(100vh - 75px);

    .about {
        padding: 40px 0;
        height: 100%;

        > .page-heading {
            margin-bottom: clamp(40px, 6vw, 72px);

            p {
                margin: 0;
                color: var(--quote-color);
                font-family: var(--font-sans);
                font-size: 0.75rem;
                letter-spacing: 0.24em;
                line-height: 1;
            }

            h1 {
                width: max-content;
                margin-top: 8px;
                color: var(--black);
                font-family: var(--font-serif);
                font-size: clamp(1.75rem, 4vw, 3.5rem);
                font-weight: 700;
                letter-spacing: 0.12em;
                line-height: 1;
                white-space: nowrap;
                view-transition-name: section-title;
            }
        }

        .about-article {
            .about-article-content {
                line-height: 1.8;
                padding-bottom: 30px;
                font-family: var(--font-serif);
                color: var(--light-dark);

                .about-social {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-left: -10px;

                    a,
                    button {
                        display: grid;
                        place-items: center;
                        width: 38px;
                        height: 38px;
                        padding: 0;
                        color: var(--light-dark);
                        background: transparent;
                        border: 0;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: color 160ms ease, background-color 160ms ease;

                        &:hover,
                        &:focus-visible {
                            color: var(--black);
                            background: rgba(255, 255, 255, 0.3);
                        }

                        &:focus-visible {
                            outline: 2px solid var(--skyblue);
                            outline-offset: 2px;
                        }
                    }

                    svg {
                        width: 18px;
                        height: 18px;
                        fill: currentColor;
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

                b, strong {
                    color: var(--b-color);
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
            padding: 40px 0;

            .about-article {
                .about-article-content {
                    padding-bottom: 30px;

                    ul {
                        padding-left: 1.5em;
                    }
                }
            }
        }
    }
}
</style>
