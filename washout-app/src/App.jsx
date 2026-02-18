import { useMemo } from 'react'
import { useWashoutState } from './hooks/useWashoutState'
import { phases } from './data/phases'

import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ViewTabs from './components/ViewTabs'

import TimelineTrack from './components/JourneyView/TimelineTrack'
import DaySlider from './components/JourneyView/DaySlider'
import PhaseCard from './components/JourneyView/PhaseCard'

import MetricCard from './components/MetricsView/MetricCard'
import InsightBanner from './components/MetricsView/InsightBanner'

import QuestionCard from './components/DailyQuestionView/QuestionCard'
import QuestionQueue from './components/DailyQuestionView/QuestionQueue'

function getMetrics(day) {
  const hrv = Math.round(52 - (day * 0.28) + Math.sin(day * 0.7) * 3)
  const hr = Math.round(62 + (day * 0.12) + Math.cos(day * 0.5) * 1.5)
  const sleep = Math.round(88 - (day * 0.2) + Math.sin(day * 0.4) * 4)
  return { hrv, hr, sleep }
}

function getSparkData(day, metricFn) {
  const data = []
  for (let i = Math.max(0, day - 6); i <= day; i++) {
    data.push(metricFn(i))
  }
  return data
}

export default function App() {
  const {
    currentDay,
    currentView,
    setCurrentView,
    selectedForks,
    selectFork,
    selectedOption,
    answerQuestion,
    activePhase,
    timelineProgress,
    changeDay,
  } = useWashoutState()

  const metrics = useMemo(() => getMetrics(currentDay), [currentDay])

  const hrvSpark = useMemo(
    () => getSparkData(currentDay, d => 52 - (d * 0.28) + Math.sin(d * 0.7) * 3),
    [currentDay]
  )
  const hrSpark = useMemo(
    () => getSparkData(currentDay, d => 62 + (d * 0.12) + Math.cos(d * 0.5) * 1.5),
    [currentDay]
  )
  const sleepSpark = useMemo(
    () => getSparkData(currentDay, d => 88 - (d * 0.2) + Math.sin(d * 0.4) * 4),
    [currentDay]
  )

  return (
    <>
      <div className="ambient-bg" />
      <div className="grain-overlay" />

      <main style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 1.25rem 3rem',
      }}>
        <Header />
        <HeroSection currentDay={currentDay} activePhase={activePhase} />

        <div className="animate-in" style={{ animationDelay: '50ms' }}>
          <DaySlider currentDay={currentDay} onChange={changeDay} />
        </div>

        <div className="animate-in" style={{ animationDelay: '100ms' }}>
          <TimelineTrack
            currentDay={currentDay}
            progress={timelineProgress}
            onMarkerClick={changeDay}
          />
        </div>

        <div className="animate-in" style={{ animationDelay: '150ms' }}>
          <ViewTabs currentView={currentView} onChange={setCurrentView} />
        </div>

        {/* Journey View */}
        {currentView === 'journey' && (
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            {phases.map((phase, i) => {
              const isActive = activePhase?.id === phase.id
              const isDone = currentDay > phase.dayEnd

              return (
                <div
                  key={phase.id}
                  className="animate-in"
                  style={{ animationDelay: `${250 + i * 50}ms` }}
                >
                  <PhaseCard
                    phase={phase}
                    isActive={isActive}
                    isDone={isDone}
                    currentDay={currentDay}
                    selectedForks={selectedForks}
                    onSelectFork={selectFork}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Daily Question View */}
        {currentView === 'daily' && (
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            <QuestionCard
              currentDay={currentDay}
              selectedOption={selectedOption}
              onAnswer={answerQuestion}
            />
            <QuestionQueue currentDay={currentDay} />
          </div>
        )}

        {/* Metrics View */}
        {currentView === 'metrics' && (
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            <InsightBanner currentDay={currentDay} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}>
              <div className="animate-in" style={{ animationDelay: '250ms' }}>
                <MetricCard
                  label="HRV"
                  value={`${metrics.hrv} ms`}
                  sub="Heart rate variability"
                  sparkData={hrvSpark}
                />
              </div>
              <div className="animate-in" style={{ animationDelay: '300ms' }}>
                <MetricCard
                  label="Resting HR"
                  value={`${metrics.hr} bpm`}
                  sub="Resting heart rate"
                  sparkData={hrSpark}
                />
              </div>
              <div className="animate-in" style={{ animationDelay: '350ms' }}>
                <MetricCard
                  label="Sleep Score"
                  value={`${metrics.sleep}%`}
                  sub="Sleep quality index"
                  sparkData={sleepSpark}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
