export const phases = [
  {
    id: 'entry',
    dayStart: 0,
    dayEnd: 13,
    range: 'Day 1 – 13',
    title: 'Washout Begins',
    icon: '🌱',
    body: "Your clinical study has ended, and your washout period has officially started. Over the next two weeks, your body will begin returning to its natural baseline. We\u2019ll track your biometrics daily and ask one simple question to monitor how you\u2019re feeling.",
    pills: ['Wearable tracking active', '1 daily question', '+5 ♥ per answer', 'Invite-only access']
  },
  {
    id: 'fork-14',
    dayStart: 14,
    dayEnd: 14,
    range: 'Day 14 — Decision Point',
    title: 'A New Study Is Ready',
    icon: '⚡',
    body: "You\u2019ve reached the halfway mark. A new Real-World Evidence (RWE) study is available and you qualify for priority enrollment. You can join now or continue your washout for the full 30-day rebaseline.",
    pills: ['Priority study access', 'In-app + email notification', 'No pressure — both paths valid'],
    hasFork: true,
    forkOptions: [
      { label: 'Available now', title: 'Join the RWE Study', desc: 'Start your next intervention with priority enrollment. Your washout data carries over.', highlight: true },
      { label: 'Continue washout', title: 'Stay the Course', desc: 'Complete the full 30-day rebaseline. First in line for clinical studies at Day 30.', highlight: false }
    ]
  },
  {
    id: 'deep',
    dayStart: 15,
    dayEnd: 29,
    range: 'Day 15 – 29',
    title: 'Deep Rebaseline',
    icon: '📊',
    body: "You\u2019ve chosen to continue your washout. This phase goes deeper \u2014 questions become more reflective, and your biometric data paints a clearer picture of your true baseline. Your commitment here unlocks priority access to clinical-grade studies.",
    pills: ['Deeper survey questions', 'HRV & recovery tracking', 'Comparison vs. study period']
  },
  {
    id: 'complete',
    dayStart: 30,
    dayEnd: 30,
    range: 'Day 30 — Washout Complete',
    title: "You're Clear to Go",
    icon: '🏆',
    body: "Congratulations \u2014 your 30-day washout is complete. Your baseline has been fully re-established, and you\u2019re now eligible for the most rigorous clinical studies on the platform. Your dedication has earned you top-tier status.",
    pills: ['Washout summary delivered', 'Clinical study eligibility unlocked', 'Tier status upgraded', 'Heartbeat bonus earned'],
    hasFork: true,
    forkOptions: [
      { label: 'Exclusive access', title: 'Join a Clinical Study', desc: 'Your rebaseline qualifies you for our most rigorous, highest-value studies.', highlight: true },
      { label: 'Coming soon', title: 'Browse the Catalog', desc: 'Explore available public and RWE studies at your own pace.', highlight: false }
    ]
  }
]
