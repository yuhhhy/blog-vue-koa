<template>
    <div class="sidebar-author">
        <div class="author-avatar">
            <img src="@/assets/images/avatar.avif" alt="my avatar">
        </div>
        <span id="author-name">yuhhhy</span>
        <div id="author-words">
            <p>纵使不安彷徨，即便茫然无措，也依然迈步前行</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-author {
    background-color: var(--white);
    color: var(--light-dark);
    min-height: 300px;
    padding: 0 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }

    .author-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            transform: scale(1.05);
            transition: 0.4s;
        }

        img {
            width: 100%;
            height: 100%;
        }
    }

    #author-name {
        margin: -10px 0 -20px 0;
        color: var(--blue);
        font-weight: 800;
        font-size: 1rem;
    }

    #author-words {
        text-align: center;
        max-width: 100%;
        word-wrap: break-word; // 长单词断行

        p {
            margin-top: .5rem;
        }
    }

}
</style>
