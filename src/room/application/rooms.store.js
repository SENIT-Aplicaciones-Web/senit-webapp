import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { RoomApi } from '../infrastructure/room.api.js'

/**
 * @summary Application store for room availability and room administration.
 */
const useRoomsStore = defineStore('rooms', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const roomApi = new RoomApi()

  const rooms = computed(() => dataContext.rooms)
  const roomsWithDetails = computed(() => dataContext.roomsWithDetails)
  const availableRooms = computed(() => dataContext.availableRooms)

  /**
   * @summary Gets a room by its identifier from the local operational context.
   * @param {number|string} roomId Room id.
   * @returns {object|null}
   */
  function getRoomById(roomId) {
    return dataContext.getRoomById(roomId)
  }

  /**
   * @summary Returns the Spanish label for a room status.
   * @param {string} status Room status.
   * @returns {string}
   */
  function getRoomStatusLabel(status) {
    return dataContext.getRoomStatusLabel(status)
  }

  /**
   * @summary Creates a room in the hotel operational context.
   * @param {object} roomData Room form data.
   * @returns {{ok: boolean, message: string, room?: object}}
   */
  function createRoom(roomData) {
    return dataContext.createRoom(roomData)
  }

  /**
   * @summary Updates room status after cleaning, maintenance or availability changes.
   * @param {number|string} roomId Room id.
   * @param {string} status New room status.
   * @returns {{ok: boolean, message: string}}
   */
  function updateRoomStatus(roomId, status) {
    return dataContext.updateRoomStatus(roomId, status)
  }

  function updateRoom(roomId, roomData) {
    return dataContext.updateRoom(roomId, roomData)
  }

  function deleteRoom(roomId) {
    return dataContext.deleteRoom(roomId)
  }

  /**
   * @summary Loads rooms from the fake REST API when the service is running.
   * @returns {Promise<Room[]>}
   */
  function fetchRooms() {
    return roomApi.getAllRooms()
  }

  return {
    rooms,
    roomsWithDetails,
    availableRooms,
    getRoomById,
    getRoomStatusLabel,
    createRoom,
    updateRoomStatus,
    updateRoom,
    deleteRoom,
    fetchRooms
  }
})

export default useRoomsStore
