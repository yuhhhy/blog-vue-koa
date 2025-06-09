<script setup>

</script>

<template>
    <div class="info">
        <div class="info-article">
            <!-- 内容区域 -->
            <div class="info-article-content">

                <h1>网站信息</h1>
                    这里是关于本站的一些你可能想要知道的信息~

                <h1>关于本站</h1>
                    <p>本站前端基于 Vue 3.5.13<img src="@/assets/images/vue.svg" alt="vue_icon" style="width: 20px; height: 20px; position: relative; top: 4px;">版本搭建，使用Vite<img src="@/assets/images/vite.svg" alt="vite_icon" style="width: 20px; height: 20px; position: relative; top: 3px;">作为构建工具。整体设计遵循组件化、模块化的思想。</p>
                    <p>使用Axios <img src="@/assets/images/axios.svg" alt="axios_icon" style="width: 62px; height: 14px; position: relative; top: 2px;"> 处理请求</p>
                    <p>使用Sass <img src="@/assets/images/sass.svg" alt="sass_icon" style="width: 28px; height: 24px; position: relative; top: 5px;">扩充CSS语法</p>
                    <p>使用Pinia<img src="@/assets/images/pinia.svg" alt="pinia_icon" style="width: 22px; height: 22px; position: relative; top: 2px;">作为状态管理工具</p>
                    <p>使用ElementPlus <img src="@/assets/images/elementplus.svg" alt="elementplus_icon" style="width: 72px; height: 18px; position: relative; top: 4px;"> 组件库</p>
                                    

                    <h1>评论头像如何获取？</h1>
                    <p>头像会通过评论信息填写的邮箱地址获取：</p>
                    <ol>
                        <li>首先会尝试获取Gravatar头像</li>
                        <li>如果Gravatar头像获取失败且邮箱为QQ邮箱，那么通过 https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100 获取QQ头像</li>
                    </ol>
                    <p>关于 <a href="https://en.gravatar.com" target="_blank">Gravatar <img src="@/assets/images/gravatar.svg" alt="gravatar_icon" style="width: 16px; height: 16px; position: relative; top: 1px;"></a>（需要科学上网）</p>

                <h1>RSS</h1>
                

                <h1>开源协议</h1>
                    <p>网站源码在 <a href="https://github.com/yuhhhy/blog-vue-koa" target="_blank">github <img src="@/assets/images/github.svg" alt="github_icon" style="width: 20px; height: 20px; position: relative; top: 2px;"></a>上开源</p>
                    <p>网站源码采用<a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank"> GPL <img src="@/assets/images/GPLv3.svg" alt="GPLv3_icon" style="width: 36px; height: 20px;"></a>协议开源</p>
                    
      
                <h1>网站时间线</h1>
                    <ul>
                        <li>2025.06.04 进行公安备案</li>
                        <li>2025.05.21 ICP备案通过</li>
                        <li>2025.05.16 开始写博客的后管理系统代码</li>
                        <li>2025.05.13 进行ICP备案</li>
                        <li>2025.05.11 开始写博客的后端代码</li>
                        <li>2025.05.02 部署于Vercel <img src="@/assets/images/vercel.svg" alt="vercel_icon" style="width: 18px; height: 18px; position: relative; top: 2px;">，这时还是静态页面</li>
                        <li>2025.04.14 开始写博客前端代码</li>
                        <li>2025.04.14 打算做自己的个人博客</li>
                    </ul>
                    
                <h1>版权协议</h1>
                    <p>除非特别注明，本站所有文章采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en" target="_blank">CC BY-NC-SA 4.0 <img src="@/assets/images/CC-by-nc-sa.svg" alt="CC-by-nc-sa_icon" style="width: 72px; height: 22px; position: relative; top: 4px;"></a>协议授权。</p>
                    <p>这意味着您可以自由地转载、修改文章的内容，并且无需通知作者，但必须遵守以下规定：</p>
                    <ol>
                        <li>在使用本作品时，您必须清晰标明原作者身份，并附上指向该许可条款的链接，同时需说明是否对原作内容做了任何调整或改动。</li>
                        <li>严禁将本作品用于任何商业性用途。</li>
                        <li>若您以本作品为基础进行改编、混合或再创作，那么您所发布的所有衍生成果也必须依据同一协议（CC BY-NC-SA 4.0）进行分发。</li>
                    </ol>

            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.info {
    background-color: var(--light);
    margin-top: 64px;
    padding: 40px calc(17vw + 10px);
    display: flex;
    height: 100%;

    .info-article {
        background-color: var(--white);
        border-radius: 10px;
        flex: 1;

        .info-article-content {
            padding: 0 30px 30px 30px;
            line-height: 1.8;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: var(--light-dark);

            img {
                display: inline;
                margin: 0;
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

            address {
                font-style: normal;
            }
        }
    }
    @media (max-width: 768px) {
        padding: 0;
        flex-direction: column;

        .info-article {
            margin-right: 0;
            margin-bottom: 20px;

            .info-article-content {
                padding-bottom: 30px;
                padding-left: 30px;
                padding-right: 30px;

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
