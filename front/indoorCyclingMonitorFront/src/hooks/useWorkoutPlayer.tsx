import { useCallback, useEffect, useRef, useState } from 'react'
import { Step } from '../entities/step'

export function useWorkoutPlayer(workoutSteps: Step[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)

  const currentStep = workoutSteps[currentStepIndex] || null

  const start = useCallback(() => {
    if (workoutSteps.length === 0) return
    setCurrentStepIndex(0)
    setTimeLeft(workoutSteps[0].duration)
    setIsRunning(true)
    setIsFinished(false)
  }, [workoutSteps])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    setCurrentStepIndex(0)
    setTimeLeft(0)
    setIsRunning(false)
    setIsFinished(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const next = useCallback(() => {
    if (currentStepIndex + 1 < workoutSteps.length) {
      setCurrentStepIndex((prev) => prev + 1)
      setTimeLeft(workoutSteps[currentStepIndex + 1].duration)
    } else {
      setIsRunning(false)
      setIsFinished(true)
      setTimeLeft(0)
    }
  }, [currentStepIndex, workoutSteps])

  useEffect(() => {
    if (!isRunning) return
    if (isFinished) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          if (currentStepIndex + 1 < workoutSteps.length) {
            setCurrentStepIndex(currentStepIndex + 1)
            return workoutSteps[currentStepIndex + 1].duration
          } else {
            setIsRunning(false)
            setIsFinished(true)
            return 0
          }
        }
        return prev - 0.1
      })
    }, 100)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, currentStepIndex, workoutSteps, isFinished])

  const progress = currentStep
    ? 100 - (timeLeft / currentStep.duration) * 100
    : 0

  const stepCounter = `${currentStepIndex + 1}/${workoutSteps.length}`

  return {
    currentStep,
    currentStepIndex,
    timeLeft: Math.max(0, Number(timeLeft.toFixed(1))),
    isRunning,
    isFinished,
    start,
    stop,
    reset,
    next,
    progress,
    stepCounter
  }
}
