import { create } from 'zustand'

type CyclingData = {
  userFTP: number | null
  power: number | null
  heartRate: number | null
  cadence: number | null
  setCyclingData: (data: {
    power: number
    heartRate: number
    cadence: number
  }) => void
  setUserFTP: (ftp: number | null) => void
}

const useCyclingDataStore = create<CyclingData>((set) => ({
  userFTP: null,
  power: null,
  heartRate: null,
  cadence: null,
  setCyclingData: ({ power, heartRate, cadence }) =>
    set({ power, heartRate, cadence }),
  setUserFTP: (ftp) => set({ userFTP: ftp })
}))

export default useCyclingDataStore
