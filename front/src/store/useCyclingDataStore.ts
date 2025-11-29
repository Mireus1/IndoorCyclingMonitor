import { create } from 'zustand'

type CyclingData = {
  userFTP: number | null
  power: number | null
  heartRate: number | null
  cadence: number | null
  setCyclingData: (data: {
    power: number | null
    heartRate: number | null
    cadence: number | null
  }) => void
  setUserFTP: (ftp: number | null) => void
  trainerSensorName: string | null
  setTrainerSensorName: (name: string | null) => void
}

const useCyclingDataStore = create<CyclingData>((set) => ({
  userFTP: null,
  power: null,
  heartRate: null,
  cadence: null,
  setCyclingData: ({ power, heartRate, cadence }) =>
    set({ power, heartRate, cadence }),
  setUserFTP: (ftp) => set({ userFTP: ftp }),
  trainerSensorName: null,
  setTrainerSensorName: (name) => set({ trainerSensorName: name })
}))

export default useCyclingDataStore
