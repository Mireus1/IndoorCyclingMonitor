import { create } from 'zustand'
import { Step } from '../entities/step'

type WorkoutState = {
  selectedWorkout: Step[] | null
  setWorkout: (selectedWorkout: Step[]) => void
}

const useWorkoutStore = create<WorkoutState>((set) => ({
  selectedWorkout: null,
  setWorkout: (selectedWorkout) => set({ selectedWorkout })
}))

export default useWorkoutStore
