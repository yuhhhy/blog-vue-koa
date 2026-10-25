<script setup>
defineProps({
  headline: { type: String, default: '' },
  supportingText: { type: String, default: '' },
  overline: { type: String, default: '' }
})
</script>

<template>
  <article class="admin-list-item">
    <div v-if="$slots.leading" class="admin-list-item__leading">
      <slot name="leading" />
    </div>

    <div class="admin-list-item__content">
      <div v-if="overline || $slots.overline" class="admin-list-item__overline">
        <slot name="overline">{{ overline }}</slot>
      </div>
      <div class="admin-list-item__headline">
        <slot name="headline">{{ headline }}</slot>
      </div>
      <div v-if="supportingText || $slots.supporting" class="admin-list-item__supporting">
        <slot name="supporting">{{ supportingText }}</slot>
      </div>
    </div>

    <div v-if="$slots.trailing" class="admin-list-item__trailing">
      <slot name="trailing" />
    </div>

    <div v-if="$slots.actions" class="admin-list-item__actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<style scoped>
.admin-list-item {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  min-height: 80px;
  align-items: center;
  gap: 16px;
  padding: 12px 12px 12px 16px;
  border-radius: 4px;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-low);
  transition: background-color 150ms ease;
}

.admin-list-item:hover {
  background: var(--md-sys-color-surface-container);
}

.admin-list-item:focus-within {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}

.admin-list-item__leading {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
}

.admin-list-item__content {
  min-width: 0;
  align-self: center;
}

.admin-list-item__overline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
}

.admin-list-item__headline {
  min-width: 0;
  overflow: hidden;
  color: var(--md-sys-color-on-surface);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-list-item__supporting {
  display: -webkit-box;
  min-width: 0;
  margin-top: 2px;
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.admin-list-item__trailing {
  display: flex;
  max-width: 300px;
  min-height: 48px;
  align-items: center;
  justify-content: flex-end;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
  line-height: 18px;
  text-align: right;
}

.admin-list-item__actions {
  display: grid;
  min-width: 48px;
  min-height: 48px;
  place-items: center;
}

@media (max-width: 760px) {
  .admin-list-item {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
  }

  .admin-list-item__trailing {
    display: none;
  }
}
</style>
