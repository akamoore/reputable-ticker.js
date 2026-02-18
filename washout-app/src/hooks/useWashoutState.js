import { useState, useMemo } from 'react'
import { phases } from '../data/phases'

export function useWashoutState() {
  const [currentDay, setCurrentDay] = useState(1)
  const [currentView, setCurrentView] = useState('journey')
  const [selectedForks, setSelectedForks] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)
  const [answeredDays, setAnsweredDays] = useState({})

  const activePhase = useMemo(
    () => phases.find(p => currentDay >= p.dayStart && currentDay <= p.dayEnd),
    [currentDay]
  )

  const timelineProgress = (currentDay / 30) * 100

  const selectFork = (phaseId, optionIndex) => {
    setSelectedForks(prev => ({ ...prev, [phaseId]: optionIndex }))
  }

  const answerQuestion = (option) => {
    setSelectedOption(option)
    setAnsweredDays(prev => ({ ...prev, [currentDay]: option }))
  }

  const changeDay = (day) => {
    const newDay = Number(day)
    setCurrentDay(newDay)
    setSelectedOption(answeredDays[newDay] ?? null)
  }

  return {
    currentDay,
    currentView,
    setCurrentView,
    selectedForks,
    selectFork,
    selectedOption,
    answerQuestion,
    answeredDays,
    activePhase,
    timelineProgress,
    changeDay,
  }
}
