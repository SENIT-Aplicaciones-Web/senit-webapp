<script setup>
import { ref } from 'vue'
import useIamStore from '../../../iam/application/iam.store.js'

const iamStore = useIamStore()

const upcomingReservations = ref([
  { guest: 'Alex Thompson', room: 'King Suite', status: 'Confirmado' },
  { guest: 'Maria Gracia', room: 'Doble Deluxe', status: 'Pre-pagado' },
  { guest: 'James Wilson', room: 'Twin Estándar', status: 'Pendiente' },
  { guest: 'Sarah Connor', room: 'Executive Box', status: 'Confirmado' }
])

const alerts = ref([
  {
    title: 'Limpieza 204',
    subtitle: 'Pendiente desde hace 45m',
    status: 'SALIDA',
    type: 'warning'
  },
  {
    title: 'Urgente 105',
    subtitle: 'Solicitud de huésped inmediata',
    status: 'ALTA',
    type: 'danger'
  },
  {
    title: 'Pago: John Doe',
    subtitle: 'Factura #8892 pendiente',
    status: '$450.00',
    type: 'info'
  },
  {
    title: 'Mantenimiento 401',
    subtitle: 'Fuga AC - Asignado a Técnico',
    status: 'EN CURSO',
    type: 'primary'
  }
])

const rooms = ref([
  { number: 101, status: 'occupied' },
  { number: 102, status: 'available' },
  { number: 103, status: 'blocked' },
  { number: 104, status: 'occupied' },
  { number: 105, status: 'available' },
  { number: 106, status: 'occupied' },
  { number: 107, status: 'available' },
  { number: 108, status: 'occupied' },
  { number: 109, status: 'occupied' },
  { number: 110, status: 'available' },
  { number: 111, status: 'available' },
  { number: 112, status: 'available' }
])

function signOut() {
  iamStore.signOut()
  window.location.href = '/iam/sign-in'
}
</script>

<template>
  <main class="dashboard-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">
          <div class="icon-block blue rounded-tl"></div>
          <div class="icon-block green small"></div>
          <div class="icon-block blue"></div>
          <div class="icon-block blue rounded-br"></div>
        </div>
        <h1>Senit</h1>
      </div>

      <nav class="nav-menu">
        <a href="#" class="nav-item active">Panel de Control</a>
        <a href="#" class="nav-item">Habitaciones</a>
        <a href="#" class="nav-item">Estadías</a>
        <a href="#" class="nav-item">Check-in</a>
        <a href="#" class="nav-item">Reservas</a>
        <a href="#" class="nav-item">Alertas</a>
        <a href="#" class="nav-item">Configuración</a>
      </nav>

      <button class="logout-button" @click="signOut">
        <i class="pi pi-sign-out"></i>
        <span>Cerrar sesión</span>
      </button>
    </aside>

    <section class="content-area">
      <header class="topbar">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" placeholder="Buscar huésped, habitación o reserva..." />
        </div>

        <div class="top-actions">
          <button class="report-button">
            <i class="pi pi-print"></i>
            Generar reporte
          </button>
          <button class="new-reservation-button">
            <i class="pi pi-plus"></i>
            Nueva reserva
          </button>
        </div>
      </header>

      <section class="page-title">
        <h2>Panel de Recepción</h2>
        <p>Bienvenido, {{ iamStore.currentUser?.username || 'Recepcionista' }}. Aquí tienes un resumen del día.</p>
      </section>

      <section class="stats-grid">
        <div class="stat-card blue-card">
          <div>
            <span class="stat-label">Check-ins hoy</span>
            <div class="stat-value">12 <small>/18</small></div>
          </div>
          <i class="pi pi-arrow-right stat-icon"></i>
        </div>

        <div class="stat-card orange-card">
          <div>
            <span class="stat-label">Check-outs hoy</span>
            <div class="stat-value">08 <small>/14</small></div>
          </div>
          <i class="pi pi-arrow-left stat-icon"></i>
        </div>

        <div class="stat-card green-card">
          <div>
            <span class="stat-label">Disponibles</span>
            <div class="stat-value">24 <small>de 120</small></div>
          </div>
          <i class="pi pi-building stat-icon"></i>
        </div>

        <div class="stat-card purple-card">
          <div>
            <span class="stat-label">Ocupación</span>
            <div class="stat-value">80% <small>total</small></div>
          </div>
          <i class="pi pi-home stat-icon"></i>
        </div>
      </section>

      <section class="middle-grid">
        <div class="panel reservations-panel">
          <div class="panel-header">
            <div class="tabs">
              <span class="tab active">Próximas Reservas</span>
              <span class="tab">Check-ins</span>
              <span class="tab">Check-outs</span>
            </div>
            <button class="link-button">Ver todo</button>
          </div>

          <table class="reservations-table">
            <thead>
            <tr>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Estado</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="reservation in upcomingReservations" :key="reservation.guest">
              <td>{{ reservation.guest }}</td>
              <td>{{ reservation.room }}</td>
              <td>
                  <span
                      class="status-badge"
                      :class="{
                      confirmed: reservation.status === 'Confirmado',
                      prepaid: reservation.status === 'Pre-pagado',
                      pending: reservation.status === 'Pendiente'
                    }"
                  >
                    {{ reservation.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="panel alerts-panel">
          <div class="panel-header">
            <h3>Alertas y Tareas</h3>
            <button class="mini-button">Ver todo</button>
          </div>

          <div class="alert-list">
            <div
                class="alert-item"
                v-for="alert in alerts"
                :key="alert.title"
            >
              <div class="alert-icon" :class="alert.type">
                <i class="pi pi-bell"></i>
              </div>
              <div class="alert-content">
                <strong>{{ alert.title }}</strong>
                <small>{{ alert.subtitle }}</small>
              </div>
              <span class="alert-status" :class="alert.type">{{ alert.status }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel rooms-panel">
        <div class="panel-header">
          <h3>Vista Rápida de Habitaciones</h3>
        </div>

        <div class="rooms-row">
          <div
              class="room-item"
              v-for="room in rooms"
              :key="room.number"
          >
            <span class="room-number">{{ room.number }}</span>
            <span
                class="room-dot"
                :class="room.status"
            ></span>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <span class="room-dot occupied"></span>
            <span>Ocupada</span>
          </div>
          <div class="legend-item">
            <span class="room-dot available"></span>
            <span>Disponible</span>
          </div>
          <div class="legend-item">
            <span class="room-dot blocked"></span>
            <span>Bloqueada</span>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: linear-gradient(135deg, #f8fbff 0%, #eef3fb 100%);
}

.sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border-right: 1px solid #e2e8f0;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 2.5rem;
}

.brand h1 {
  font-size: 2.2rem;
  color: #0f3a8a;
  margin: 0;
  font-weight: 800;
}

.brand-icon {
  width: 44px;
  height: 44px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.icon-block {
  background: #2563eb;
}

.rounded-tl {
  border-radius: 10px 10px 0 10px;
}

.rounded-br {
  border-radius: 0 0 10px 0;
}

.green {
  background: #39b98c;
}

.small {
  transform: scale(0.8);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.nav-item {
  padding: 0.95rem 1rem;
  border-radius: 14px;
  color: #334155;
  font-size: 1rem;
  font-weight: 500;
  transition: 0.2s ease;
}

.nav-item:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.nav-item.active {
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.20);
}

.logout-button {
  margin-top: auto;
  border: none;
  border-radius: 14px;
  background: #f1f5f9;
  color: #475569;
  padding: 0.95rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
}

.logout-button:hover {
  background: #e2e8f0;
}

.content-area {
  padding: 2rem 2.2rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.search-box {
  flex: 1;
  max-width: 760px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.search-box i {
  color: #64748b;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  font-size: 1rem;
  color: #0f172a;
}

.top-actions {
  display: flex;
  gap: 0.9rem;
}

.report-button,
.new-reservation-button {
  border: none;
  border-radius: 14px;
  padding: 0.95rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.report-button {
  background: #ffffff;
  color: #334155;
  border: 1px solid #dbe3ef;
}

.new-reservation-button {
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.20);
}

.page-title h2 {
  margin: 0;
  font-size: 2.2rem;
  color: #1e3a8a;
  font-weight: 800;
}

.page-title p {
  margin: 0.45rem 0 1.4rem;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.stat-card {
  border-radius: 18px;
  padding: 1.2rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10);
}

.blue-card {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
}

.orange-card {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

.green-card {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.purple-card {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.95;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
}

.stat-value small {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.stat-icon {
  font-size: 1.8rem;
  opacity: 0.85;
}

.middle-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem 1rem 1.1rem;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.tab {
  color: #64748b;
  font-weight: 500;
}

.tab.active {
  color: #0f172a;
  font-weight: 800;
}

.link-button,
.mini-button {
  border: none;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th {
  text-align: left;
  color: #64748b;
  font-size: 0.9rem;
  padding: 0.85rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.reservations-table td {
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.status-badge {
  display: inline-block;
  min-width: 108px;
  text-align: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.confirmed {
  background: #dcfce7;
  color: #15803d;
}

.prepaid {
  background: #dbeafe;
  color: #1d4ed8;
}

.pending {
  background: #fef3c7;
  color: #b45309;
}

.alerts-panel h3,
.rooms-panel h3 {
  margin: 0;
  color: #0f172a;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.alert-item {
  display: grid;
  grid-template-columns: 38px 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.7rem;
  background: #f8fafc;
  border-radius: 14px;
}

.alert-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
}

.alert-icon.warning,
.alert-status.warning {
  background: #fef3c7;
  color: #b45309;
}

.alert-icon.danger,
.alert-status.danger {
  background: #fee2e2;
  color: #dc2626;
}

.alert-icon.info,
.alert-status.info {
  background: #dbeafe;
  color: #2563eb;
}

.alert-icon.primary,
.alert-status.primary {
  background: #ede9fe;
  color: #7c3aed;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-content strong {
  color: #0f172a;
  font-size: 0.95rem;
}

.alert-content small {
  color: #64748b;
}

.alert-status {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.rooms-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.6rem 0 1rem;
}

.room-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  min-width: 46px;
}

.room-number {
  font-size: 0.82rem;
  color: #475569;
}

.room-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}

.room-dot.occupied {
  background: #111827;
}

.room-dot.available {
  background: #ffffff;
  border: 2px solid #94a3b8;
}

.room-dot.blocked {
  background: #94a3b8;
}

.legend {
  display: flex;
  gap: 1.4rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #475569;
  font-size: 0.9rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .middle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .top-actions {
    justify-content: stretch;
  }

  .top-actions button {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .content-area {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-title h2 {
    font-size: 1.7rem;
  }
}
</style>