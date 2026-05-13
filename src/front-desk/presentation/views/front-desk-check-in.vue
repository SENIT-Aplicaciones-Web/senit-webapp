<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  name: '',
  dni: '',
  phone: '',
  email: '',
  roomId: '',
  hours: 1
})

const rooms = ref([
  { id: 101, label: '101 - Standard', pricePerHour: 30 },
  { id: 106, label: '106 - Standard', pricePerHour: 30 },
  { id: 201, label: '201 - Deluxe', pricePerHour: 45 },
  { id: 202, label: '202 - Deluxe', pricePerHour: 45 },
  { id: 302, label: '302 - Suite', pricePerHour: 65 }
])

const selectedRoom = computed(() => {
  return rooms.value.find(room => room.id === Number(form.value.roomId))
})

const pricePerHour = computed(() => {
  return selectedRoom.value?.pricePerHour ?? 0
})

const initialAmount = computed(() => {
  return pricePerHour.value * Number(form.value.hours || 0)
})

const checkoutLimit = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + Number(form.value.hours || 0))

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)
})

function submitCheckIn() {
  alert(`Check-in registrado para ${form.value.name || 'huésped'} en habitación ${form.value.roomId}`)
}

function goBack() {
  router.push({ name: 'front-desk-stays' })
}
</script>

<template>
  <section class="check-in-page">
    <header class="check-in-topbar">
      <div class="global-search">
        <input
            type="text"
            :placeholder="t('frontDesk.checkIn.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.checkIn.title') }}</h1>
      <p>{{ t('frontDesk.checkIn.subtitle') }}</p>
    </section>

    <form class="check-in-card" @submit.prevent="submitCheckIn">
      <section class="form-section">
        <h2>{{ t('frontDesk.checkIn.guestInformation') }}</h2>

        <div class="form-grid">
          <div class="field">
            <label for="name">{{ t('frontDesk.checkIn.name') }}</label>
            <input id="name" v-model="form.name" type="text" required />
          </div>

          <div class="field">
            <label for="dni">{{ t('frontDesk.checkIn.dni') }}</label>
            <input id="dni" v-model="form.dni" type="text" maxlength="8" required />
          </div>

          <div class="field">
            <label for="phone">{{ t('frontDesk.checkIn.phone') }}</label>
            <input id="phone" v-model="form.phone" type="tel" />
          </div>

          <div class="field">
            <label for="email">{{ t('frontDesk.checkIn.email') }}</label>
            <input id="email" v-model="form.email" type="email" />
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>{{ t('frontDesk.checkIn.stayDetails') }}</h2>

        <div class="form-grid">
          <div class="field">
            <label for="room">{{ t('frontDesk.checkIn.room') }} *</label>
            <select id="room" v-model="form.roomId" required>
              <option disabled value="">
                {{ t('frontDesk.checkIn.selectRoom') }}
              </option>
              <option
                  v-for="room in rooms"
                  :key="room.id"
                  :value="room.id"
              >
                {{ room.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="hours">{{ t('frontDesk.checkIn.hours') }} *</label>
            <input
                id="hours"
                v-model.number="form.hours"
                type="number"
                min="1"
                max="24"
                required
            />
          </div>
        </div>
      </section>

      <section class="summary-section">
        <h2>{{ t('frontDesk.checkIn.summary') }}</h2>

        <div class="summary-grid">
          <div class="summary-item">
            <span>{{ t('frontDesk.checkIn.pricePerHour') }}</span>
            <strong>S/. {{ pricePerHour.toFixed(2) }}</strong>
          </div>

          <div class="summary-item">
            <span>{{ t('frontDesk.checkIn.checkoutLimit') }}</span>
            <strong>{{ checkoutLimit }}</strong>
          </div>

          <div class="summary-item">
            <span>{{ t('frontDesk.checkIn.initialAmount') }}</span>
            <strong>S/. {{ initialAmount.toFixed(2) }}</strong>
          </div>
        </div>
      </section>

      <div class="button-row">
        <button class="check-in-button" type="submit">
          {{ t('frontDesk.checkIn.submit') }}
        </button>

        <button class="back-button" type="button" @click="goBack">
          {{ t('frontDesk.checkIn.back') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.check-in-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.check-in-topbar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.global-search {
  width: min(780px, 100%);
  height: 46px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.global-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 1rem;
}

.global-search i {
  color: #1e3a8a;
  font-size: 1.1rem;
}

.title-section {
  margin-bottom: 1.5rem;
}

.title-section h1 {
  margin: 0;
  color: #1e3a8a;
  font-size: 2.4rem;
  font-weight: 800;
}

.title-section p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 1.05rem;
}

.check-in-card {
  max-width: 980px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.4rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.form-section,
.summary-section {
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  padding: 1.3rem 1.6rem;
  margin-bottom: 1rem;
  background: #f8fafc;
}

.form-section h2,
.summary-section h2 {
  margin: 0 0 1.1rem;
  color: #0f172a;
  font-size: 1.2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  color: #0f172a;
  font-weight: 700;
}

.field input,
.field select {
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  padding: 0 0.9rem;
  outline: none;
  font-size: 0.98rem;
}

.field input:focus,
.field select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.summary-item span {
  display: block;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.summary-item strong {
  color: #1e3a8a;
  font-size: 1.05rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.3rem;
}

.check-in-button,
.back-button {
  min-width: 180px;
  height: 48px;
  border: none;
  border-radius: 13px;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
}

.check-in-button {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.22);
}

.back-button {
  background: #475569;
}

@media (max-width: 800px) {
  .check-in-page {
    padding: 1rem;
  }

  .form-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }

  .check-in-button,
  .back-button {
    width: 100%;
  }
}
</style>