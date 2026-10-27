<script setup>
import { ElMessage } from 'element-plus/es/components/message/index.mjs';

const copyEmail = async () => {
    await navigator.clipboard.writeText('yuhhhy109@163.com');
    ElMessage.info('邮箱已复制');
};
</script>

<template>
    <aside class="layout-sidebar" aria-label="站点侧边栏">
        <div class="sidebar-inner">
            <div class="sidebar-profile">
                <RouterLink to="/home" class="sidebar-name">一曝十寒</RouterLink>
                <p>纵使不安彷徨，即便茫然无措，也依然迈步前行。</p>
            </div>
            <nav class="sidebar-social" aria-label="关注与联系">
                <a href="/feed" target="_blank" rel="noopener noreferrer" aria-label="RSS" title="RSS">
                    <svg viewBox="0 0 1024 1024" width="18" height="18" aria-hidden="true">
                        <path d="M277.48 862.169c0 53.59-43.44 97.03-97.03 97.03s-97.04-43.44-97.04-97.03 43.44-97.03 97.03-97.03 97.04 43.44 97.04 97.03z m-78.26-797.41c-29.33-3.57-58.8 5.53-80.99 25.04a101.35 101.35 0 0 0-34.43 75.9c0.65 51.8 39.7 95.05 91.17 100.95 286.8 36.39 528.22 295.41 561.08 602.55 5.25 51.46 48.83 90.46 100.56 89.99 29.77 0.45 58.29-11.96 78.25-34.05a98.961 98.961 0 0 0 25.04-78.25c-44.21-396.75-361.93-733.63-740.68-780.98v-1.15z m6.65 334.15c-29.07-6.84-59.66 0.1-82.95 18.78a102.547 102.547 0 0 0-39.13 81c-0.22 47.06 32.34 87.92 78.25 98.21 117.38 28.17 219.11 143.2 244.94 278.97 9.39 46.99 50.3 81.05 98.21 81.78 30.24-0.07 58.9-13.53 78.25-36.78a98.616 98.616 0 0 0 21.52-81.78c-39.91-211.67-204.24-393.23-399.1-439.4v-0.78z" />
                        <path d="M119.01 937.289l135.77-135.77a95.832 95.832 0 0 1 22.69 61.43c0 53.59-43.44 97.03-97.04 97.03a95.88 95.88 0 0 1-61.42-22.69z m449.18-449.18a704.262 704.262 0 0 1 167.46 381.88c5.25 51.46 48.83 90.46 100.56 89.99 29.77 0.47 58.3-11.94 78.25-34.05a99.009 99.009 0 0 0 25.04-78.25 905.773 905.773 0 0 0-226.55-504.35l-144.76 144.78z m-162.77 388.92c9.39 46.99 50.3 81.05 98.21 81.78 30.24-0.06 58.91-13.53 78.25-36.78 19.1-22.64 27-52.67 21.52-81.78a586.957 586.957 0 0 0-125.6-263.72l-143.99 143.99a384.029 384.029 0 0 1 71.61 156.51z" />
                    </svg>
                </a>
                <a href="https://github.com/yuhhhy" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                </a>
                <button type="button" aria-label="复制邮箱地址" title="复制邮箱地址" @click="copyEmail">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M4 4h16a2 2 0 0 1 2 2v.5l-10 7-10-7V6a2 2 0 0 1 2-2Zm-2 5 9.4 6.58a1 1 0 0 0 1.2 0L22 9v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" />
                    </svg>
                </button>
            </nav>
        </div>
    </aside>
</template>

<style lang="scss" scoped>
.layout-sidebar {
    border-right: 1px solid var(--quote-color);
}

.sidebar-inner {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    padding: 32px 16px 24px;
}

.sidebar-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    color: var(--light-dark);
    text-align: center;

    .sidebar-name {
        color: var(--black);
        font-family: var(--font-serif);
        font-size: 1.4rem;
        font-weight: 700;
    }

    p {
        line-height: 1.6;
    }
}

.sidebar-social {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: auto;

    a,
    button {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--light-dark);
        cursor: pointer;

        &:hover {
            color: var(--black);
        }
    }

    svg {
        fill: currentColor;
    }
}

@media (max-width: 768px) {
    .sidebar-inner {
        padding: 20px 4px 24px;
    }

    .sidebar-profile {
        p {
            display: none;
        }

        .sidebar-name {
            font-size: 1rem;
            writing-mode: vertical-rl;
        }
    }

    .sidebar-social {
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }
}
</style>
