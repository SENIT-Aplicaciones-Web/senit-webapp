<script setup>
import { ref } from 'vue'
import useIamStore from '../../../iam/application/iam.store.js'

const iamStore = useIamStore()

const stats = ref([
  {
    label: 'Check-ins hoy',
    value: '12',
    detail: '/18',
    icon: 'pi pi-sign-in',
    className: 'blue-card'
  },
  {
    label: 'Check-outs hoy',
    value: '08',
    detail: '/14',
    icon: 'pi pi-sign-out',
    className: 'orange-card'
  },
  {
    label: 'Disponibles',
    value: '24',
    detail: 'de 120',
    icon: 'pi pi-building',
    className: 'green-card'
  },
  {
    label: 'Ocupación',
    value: '80%',
    detail: 'total',
    icon: 'pi pi-home',
    className: 'purple-card'
  }
])

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
</script>

<template>
  <section class="dashboard-page">
    <header class="topbar">
      <div class="search-box">
        <input type="text" placeholder="Buscar huésped, habitación o reserva..." />
        <i class="pi pi-search"></i>
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
      <div>
        <h1>Panel de Recepción</h1>
        <p>
          Bienvenido, {{ iamStore.currentUser?.username || 'Recepcionista' }}.
          Aquí tienes un resumen del día.
        </p>
      </div>
    </section>

    <section class="stats-grid">
      <article
          v-for="stat in stats"
          :key="stat.label"
          class="stat-card"
          :class="stat.className"
      >
        <div>
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-value">
            {{ stat.value }}
            <small>{{ stat.detail }}</small>
          </div>
        </div>

        <i :class="[stat.icon, 'stat-icon']"></i>
      </article>
    </section>

    <section class="middle-grid">
      <article class="panel reservations-panel">
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
          <tr
              v-for="reservation in upcomingReservations"
              :key="reservation.guest"
          >
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
      </article>

      <article class="panel alerts-panel">
        <div class="panel-header">
          <h2>Alertas y Tareas</h2>
          <button class="mini-button">Ver todo</button>
        </div>

        <div class="alert-list">
          <div
              v-for="alert in alerts"
              :key="alert.title"
              class="alert-item"
          >
            <div class="alert-icon" :class="alert.type">
              <i class="pi pi-bell"></i>
            </div>

            <div class="alert-content">
              <strong>{{ alert.title }}</strong>
              <small>{{ alert.subtitle }}</small>
            </div>

            <span class="alert-status" :class="alert.type">
              {{ alert.status }}
            </span>
          </div>
        </div>
      </article>
    </section>

    <section class="panel rooms-panel">
      <div class="panel-header">
        <h2>Vista Rápida de Habitaciones</h2>
      </div>

      <div class="rooms-row">
        <div
            v-for="room in rooms"
            :key="room.number"
            class="room-item"
        >
          <span class="room-number">{{ room.number }}</span>
          <span class="room-dot" :class="room.status"></span>
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
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.search-box {
  width: min(760px, 100%);
  height: 46px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  color: #0f172a;
  background: transparent;
  font-size: 1rem;
}

.search-box i {
  color: #1e3a8a;
  font-size: 1.1rem;
}

.top-actions {
  display: flex;
  gap: 0.8rem;
}

.report-button,
.new-reservation-button {
  height: 46px;
  border: none;
  border-radius: 14px;
  padding: 0 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.report-button {
  background: #ffffff;
  color: #334155;
  border: 1px solid #dbe3ef;
}

.new-reservation-button {
  color: #ffffff;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
}

.page-title {
  margin-bottom: 1.5rem;
}

.page-title h1 {
  margin: 0;
  color: #1e3a8a;
  font-size: 2.3rem;
  font-weight: 800;
}

.page-title p {
  margin: 0.45rem 0 0;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.stat-card {
  min-height: 112px;
  border-radius: 20px;
  padding: 1.2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
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
  text-transform: uppercase;
  font-size: 0.85rem;
  opacity: 0.95;
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
  font-size: 2rem;
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
  border-radius: 20px;
  padding: 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
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
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th {
  text-align: left;
  color: #64748b;
  font-size: 0.85rem;
  padding: 0.85rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
}

.reservations-table td {
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.status-badge {
  display: inline-block;
  min-width: 112px;
  text-align: center;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
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
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 16px;
}

.alert-icon {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: white;
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
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
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

.rooms-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.5rem 0 1rem;
}

.room-item {
  min-width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
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
  margin-top: 0.4rem;
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

@media (max-width: 760px) {
  .dashboard-page {
    padding: 1rem;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .top-actions {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>