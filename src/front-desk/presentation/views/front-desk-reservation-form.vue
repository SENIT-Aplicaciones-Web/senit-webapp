<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  fullName: '',
  dni: '',
  phone: '',
  email: '',
  room: '',
  guestsQuantity: 1,
  startDate: '',
  endDate: ''
})

function createReservation() {
  alert(t('frontDesk.reservationForm.createdSuccessfully'))
  router.push({ name: 'front-desk-reservations' })
}

function cancel() {
  router.push({ name: 'front-desk-reservations' })
}
</script>

<template>
  <section class="reservation-form-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.reservationForm.globalSearch')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.reservationForm.title') }}</h1>
      <p>{{ t('frontDesk.reservationForm.subtitle') }}</p>
    </section>

    <form class="reservation-form" @submit.prevent="createReservation">
      <section class="form-group">
        <h2>{{ t('frontDesk.reservationForm.ownerData') }}</h2>

        <div class="form-grid">
          <div class="field">
            <label for="fullName">
              {{ t('frontDesk.reservationForm.fullName') }} *
            </label>
            <input id="fullName" v-model="form.fullName" type="text" required />
          </div>

          <div class="field">
            <label for="dni">
              {{ t('frontDesk.reservationForm.dni') }} *
            </label>
            <input id="dni" v-model="form.dni" type="text" maxlength="8" required />
          </div>

          <div class="field">
            <label for="phone">
              {{ t('frontDesk.reservationForm.phone') }} *
            </label>
            <input id="phone" v-model="form.phone" type="tel" required />
          </div>

          <div class="field">
            <label for="email">
              {{ t('frontDesk.reservationForm.email') }} *
            </label>
            <input id="email" v-model="form.email" type="email" required />
          </div>
        </div>
      </section>

      <section class="form-group">
        <h2>{{ t('frontDesk.reservationForm.reservationData') }}</h2>

        <div class="form-grid">
          <div class="field">
            <label for="room">
              {{ t('frontDesk.reservationForm.room') }} *
            </label>
            <select id="room" v-model="form.room" required>
              <option value="" disabled>
                {{ t('frontDesk.reservationForm.selectRoom') }}
              </option>
              <option value="Habitación 101 - Piso 1">Habitación 101 - Piso 1</option>
              <option value="Habitación 142 - Piso 1">Habitación 142 - Piso 1</option>
              <option value="Habitación 242 - Piso 3">Habitación 242 - Piso 3</option>
              <option value="Habitación 301 - Piso 3">Habitación 301 - Piso 3</option>
            </select>
          </div>

          <div class="field">
            <label for="startDate">
              {{ t('frontDesk.reservationForm.startDate') }} *
            </label>
            <input id="startDate" v-model="form.startDate" type="datetime-local" required />
          </div>

          <div class="field">
            <label for="guestsQuantity">
              {{ t('frontDesk.reservationForm.guestsQuantity') }} *
            </label>
            <input
                id="guestsQuantity"
                v-model.number="form.guestsQuantity"
                type="number"
                min="1"
                max="8"
                required
            />
          </div>

          <div class="field">
            <label for="endDate">
              {{ t('frontDesk.reservationForm.endDate') }} *
            </label>
            <input id="endDate" v-model="form.endDate" type="datetime-local" required />
          </div>
        </div>
      </section>

      <div class="button-row">
        <button class="create-button" type="submit">
          {{ t('frontDesk.reservationForm.create') }}
        </button>

        <button class="cancel-button" type="button" @click="cancel">
          {{ t('frontDesk.reservationForm.cancel') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.reservation-form-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.topbar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.search-box {
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

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 1rem;
}

.search-box i {
  color: #1e3a8a;
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

.reservation-form {
  max-width: 980px;
}

.form-group {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.3rem 1.5rem;
  margin-bottom: 1.3rem;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
}

.form-group h2 {
  margin: 0 0 1.2rem;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.95rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.4rem 2rem;
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
  background: #f8fafc;
  color: #0f172a;
  padding: 0 0.9rem;
  outline: none;
  font-size: 0.98rem;
}

.field input:focus,
.field select:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.create-button,
.cancel-button {
  min-width: 170px;
  height: 50px;
  border: none;
  border-radius: 13px;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  font-size: 0.95rem;
}

.create-button {
  background: #10b981;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.22);
}

.cancel-button {
  background: #475569;
}

@media (max-width: 780px) {
  .reservation-form-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }

  .create-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
