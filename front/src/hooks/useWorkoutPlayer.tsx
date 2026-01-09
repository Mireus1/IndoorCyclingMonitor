import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Step } from '../entities/step'

const TICK_INTERVAL_MS = 100
const TICK_SECONDS = TICK_INTERVAL_MS / 1000

export function useWorkoutPlayer(workoutSteps: Step[]) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalDuration = useMemo(
    () =>
      workoutSteps.reduce((sum, step) => sum + (step?.duration ?? 0), 0),
    [workoutSteps]
  )

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(workoutSteps[0]?.duration ?? 0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const currentStep = workoutSteps[currentStepIndex] || null

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (workoutSteps.length === 0) return
    clearTimer()
    setHasStarted(true)
    setCurrentStepIndex(0)
    setTimeLeft(workoutSteps[0].duration)
    setElapsedTime(0)
    setIsRunning(true)
    setIsFinished(false)
  }, [clearTimer, workoutSteps])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    if (isFinished || !hasStarted) return
    setIsRunning(true)
  }, [hasStarted, isFinished])

  const reset = useCallback(() => {
    clearTimer()
    setCurrentStepIndex(0)
    setTimeLeft(workoutSteps[0]?.duration ?? 0)
    setElapsedTime(0)
    setIsRunning(false)
    setIsFinished(false)
    setHasStarted(false)
  }, [clearTimer, workoutSteps])

  const next = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex < workoutSteps.length) {
        setTimeLeft(workoutSteps[nextIndex].duration)
        return nextIndex
      }
      setIsRunning(false)
      setIsFinished(true)
      setTimeLeft(0)
      return prev
    })
  }, [workoutSteps])

  useEffect(() => {
    if (!isRunning || isFinished) {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= TICK_SECONDS) {
          if (currentStepIndex + 1 < workoutSteps.length) {
            setCurrentStepIndex(currentStepIndex + 1)
            return workoutSteps[currentStepIndex + 1].duration
          }
          setIsRunning(false)
          setIsFinished(true)
          return 0
        }
        return Number(Math.max(prev - TICK_SECONDS, 0).toFixed(1))
      })

      setElapsedTime((prev) => {
        if (prev >= totalDuration) return prev
        const nextElapsed = Math.min(prev + TICK_SECONDS, totalDuration)
        if (nextElapsed >= totalDuration) {
          setIsFinished(true)
          setIsRunning(false)
        }
        return Number(nextElapsed.toFixed(1))
      })
    }, TICK_INTERVAL_MS)

    return clearTimer
  }, [
    currentStepIndex,
    isFinished,
    isRunning,
    totalDuration,
    workoutSteps
  ])

  const progress = currentStep
    ? 100 - (timeLeft / currentStep.duration) * 100
    : 0

  const stepCounter = `${Math.min(
    currentStepIndex + 1,
    workoutSteps.length
  )}/${workoutSteps.length || 1}`

  const workoutProgress = totalDuration
    ? (elapsedTime / totalDuration) * 100
    : 0

  return {
    currentStep,
    currentStepIndex,
    timeLeft: Math.max(0, Number(timeLeft.toFixed(1))),
    elapsedTime: Math.max(0, Number(elapsedTime.toFixed(1))),
    totalDuration,
    workoutProgress,
    isRunning,
    isFinished,
    hasStarted,
    start,
    pause,
    resume,
    stop: pause,
    reset,
    next,
    progress,
    stepCounter
  }
}
