<script setup>
// This component represents a dashboard metric card used by the administrator and receptionist views.
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  detail: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-chart-bar' },
  className: { type: String, default: 'blue' }
})
</script>

<template>
  <article class="stat-card" :class="className">
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small>{{ detail }}</small>
    </div>
    <i :class="icon"></i>
  </article>
</template>
