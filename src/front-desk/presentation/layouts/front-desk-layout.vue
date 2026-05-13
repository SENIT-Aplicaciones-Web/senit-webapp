<script setup>
</script>

<template>
  <main class="front-desk-layout">
    <aside class="sidebar">
      <h1>Senit</h1>

      <nav>
        <router-link to="/front-desk/dashboard">Panel de Control</router-link>
        <router-link to="/front-desk/rooms">Habitaciones</router-link>
        <router-link to="/front-desk/stays">Estadías</router-link>
        <router-link to="/front-desk/check-in">Check-in</router-link>
        <router-link to="/front-desk/reservations">Reservas</router-link>
        <router-link to="/front-desk/alerts">Alertas</router-link>
        <router-link to="/front-desk/settings">Configuración</router-link>
      </nav>
    </aside>

    <section class="content">
      <router-view />
    </section>
  </main>
</template>

<style scoped>
.front-desk-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: #f8fafc;
}

.sidebar {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 2rem;
}

.sidebar h1 {
  margin: 0 0 2rem;
  color: #0f3a8a;
  font-size: 2rem;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

nav a {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  color: #334155;
  text-decoration: none;
}

nav a.router-link-active {
  background: #2563eb;
  color: white;
}

.content {
  padding: 2rem;
}
</style>