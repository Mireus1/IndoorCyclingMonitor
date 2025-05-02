import { create } from 'zustand'

type CyclingData = {
  power: number | null
  heartRate: number | null
  cadence: number | null
  setCyclingData: (data: {
    power: number
    heartRate: number
    cadence: number
  }) => void
}

const useCyclingDataStore = create<CyclingData>((set) => ({
  power: null,
  heartRate: null,
  cadence: null,
  setCyclingData: ({ power, heartRate, cadence }) =>
    set({ power, heartRate, cadence })
}))

export default useCyclingDataStore
