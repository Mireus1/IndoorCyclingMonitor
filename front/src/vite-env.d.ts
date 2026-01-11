/// <reference types="vite/client" />

interface IcmBridge {
  canDeleteWorkouts?: () => Promise<boolean>
  deleteWorkout?: (id: string) => Promise<{ ok: boolean; error?: string }>
}

interface Window {
  icm?: IcmBridge
}
