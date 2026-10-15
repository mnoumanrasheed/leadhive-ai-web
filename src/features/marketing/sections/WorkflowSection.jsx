import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gauge,
  MessageCircle,
  MessageSquare,
  Send,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react'
import { Reveal } from '@/shared/ui/Reveal'

const workflowSteps = [
  {
    number: '01',
    label: 'Incoming message',
    title: 'Demand arrives on any connected channel.',
    copy: 'LeadHive receives customer conversations across WhatsApp, Instagram, Messenger, or web chat without losing source context or customer history.',
    icon: MessageCircle,
    badge: 'Multi-Channel Inbound',
    preview: {
      channel: 'WhatsApp Business',
      sender: 'Alex Vance',
      company: 'Vance Fitness (20 Franchise Sites)',
      time: 'Just now',
      message: 'Hi team, we operate 20 franchise gyms and our current sales team takes 4+ hours to respond to member inquiries. Can LeadHive automate our tour bookings and qualify membership leads?',
      tags: ['WhatsApp Inbound', 'High Urgency', 'Franchise Expansion']
    }
  },
  {
    number: '02',
    label: 'AI understanding',
    title: 'Language becomes structured commercial context.',
    copy: 'Natural language is parsed in real time into commercial buying intent, operational scope, timeline, urgency, and decision criteria.',
    icon: BrainCircuit,
    badge: 'Real-time NLP Parsing',
    preview: {
      intent: 'Enterprise Automation & Tour Booking',
      confidence: '99.4%',
      extracted: [
        { label: 'Scope', val: '20 Gym Locations' },
        { label: 'Current Bottleneck', val: '4+ Hour Response Latency' },
        { label: 'Target Outcome', val: 'Automated Tour Bookings' },
        { label: 'Decision Role', val: 'Franchise Owner / Operator' }
      ],
      sentiment: 'High Commercial Intent'
    }
  },
  {
    number: '03',
    label: 'Qualification',
    title: 'Missing criteria are collected naturally.',
    copy: 'LeadHive asks targeted, conversational questions using your custom qualification rules to verify budget, timeframe, and technical fit.',
    icon: SlidersHorizontal,
    badge: 'Dynamic Qualification Rules',
    preview: {
      aiReply: 'Absolutely Alex! We handle multi-site tour booking workflows seamlessly. Are you looking to sync qualified bookings directly into your current CRM or booking engine?',
      checklist: [
        { text: 'Location count qualifies for Enterprise tier (20 sites > 5 min)', passed: true },
        { text: 'Immediate rollout timeline confirmed for next month', passed: true },
        { text: 'Commercial authority verified as Franchise Principal', passed: true }
      ]
    }
  },
  {
    number: '04',
    label: 'Lead scoring',
    title: 'Fit and buying signals generate priority ranking.',
    copy: 'Every conversation is evaluated against intent, scope, urgency, and ICP criteria so your highest-value deals surface to the top of the queue.',
    icon: Gauge,
    badge: 'Autonomous Priority Engine',
    preview: {
      score: 96,
      grade: 'Tier A — Hot Opportunity',
      metrics: [
        { name: 'Commercial Intent', pct: 98 },
        { name: 'Franchise ICP Fit', pct: 96 },
        { name: 'Deployment Urgency', pct: 94 },
        { name: 'Budget Readiness', pct: 95 }
      ],
      recommendation: 'Immediate Human Sales Handover'
    }
  },
  {
    number: '05',
    label: 'Sales handover',
    title: 'A seller receives an opportunity ready to act.',
    copy: 'Your sales representative receives a complete commercial dossier: verified requirements, qualification evidence, and recommended next actions.',
    icon: Send,
    badge: 'Sales-Ready Handover',
    preview: {
      rep: 'Sarah Jenkins',
      repRole: 'Enterprise Account Executive',
      dealSize: '$48,000 ARR Estimate',
      summary: 'Franchise owner with 20 gyms seeking immediate automated tour booking pipeline. Response latency bottleneck identified. Decision-maker ready for discovery walkthrough.',
      actions: ['Schedule Discovery Call', 'Sync to CRM']
    }
  }
]

export function WorkflowSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15 })
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % workflowSteps.length)
    }, 4500)
    return () => window.clearTimeout(timer)
  }, [active, inView, reducedMotion])

  const currentStep = workflowSteps[active]
  const CurrentIcon = currentStep.icon

  return (
    <section className="workflow-section" id="workflow" ref={ref}>
      <div className="container">
        {/* Intro heading */}
        <div className="workflow-intro">
          <Reveal>
            <div className="workflow-section-pill">
              <Sparkles size={13} />
              <span>How it works</span>
            </div>
            <h2>One continuous path from first message to human action.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="workflow-intro-desc">
              LeadHive keeps context intact across every touchpoint and brings your sales team in only when human judgment can close the opportunity.
            </p>
          </Reveal>
        </div>

        {/* Workflow 2-Column Experience */}
        <div className="workflow-experience-grid">
          {/* Left Column: Interactive Step Cards */}
          <div className="workflow-steps-list" role="tablist" aria-label="LeadHive workflow steps">
            {workflowSteps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = active === index

              return (
                <button
                  type="button"
                  key={step.number}
                  onClick={() => setActive(index)}
                  className={`workflow-step-card${isActive ? ' is-active' : ''}`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <div className="workflow-step-badge">
                    <span className="step-num">{step.number}</span>
                    <span className="step-icon">
                      <StepIcon size={16} />
                    </span>
                  </div>
                  <div className="workflow-step-content">
                    <div className="workflow-step-header">
                      <strong>{step.label}</strong>
                      <ChevronRight size={15} className="step-arrow" />
                    </div>
                    <p className="workflow-step-sub">{step.title}</p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-step-indicator"
                      className="workflow-step-active-bar"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Column: Dynamic Step Simulation Display */}
          <div className="workflow-stage-column">
            <motion.div
              className="workflow-stage-card"
              key={currentStep.number}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Card Header */}
              <div className="workflow-stage-top">
                <div className="workflow-stage-meta">
                  <span className="workflow-pill-accent">
                    <CurrentIcon size={14} />
                    Step {currentStep.number} — {currentStep.badge}
                  </span>
                  <span className="workflow-live-indicator">
                    <i /> Automated Stage
                  </span>
                </div>
                <h3 className="workflow-stage-headline">{currentStep.title}</h3>
                <p className="workflow-stage-copy">{currentStep.copy}</p>
              </div>

              {/* Dynamic Interactive Preview Box */}
              <div className="workflow-preview-container">
                {/* STEP 1: Incoming Message */}
                {active === 0 && (
                  <div className="wf-preview-message">
                    <div className="wf-preview-header">
                      <div className="wf-sender-info">
                        <span className="wf-channel-icon whatsapp">
                          <MessageSquare size={14} />
                        </span>
                        <div>
                          <strong>{currentStep.preview.sender}</strong>
                          <small>{currentStep.preview.company}</small>
                        </div>
                      </div>
                      <span className="wf-time-badge">
                        <Clock size={12} /> {currentStep.preview.time}
                      </span>
                    </div>
                    <div className="wf-message-bubble">
                      <p>&ldquo;{currentStep.preview.message}&rdquo;</p>
                    </div>
                    <div className="wf-tags-row">
                      {currentStep.preview.tags.map((tag) => (
                        <span className="wf-pill-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: AI Understanding */}
                {active === 1 && (
                  <div className="wf-preview-nlp">
                    <div className="wf-nlp-banner">
                      <Sparkles size={16} className="text-cyan" />
                      <div>
                        <strong>Extracted Intent: {currentStep.preview.intent}</strong>
                        <small>Confidence Score: {currentStep.preview.confidence}</small>
                      </div>
                    </div>
                    <div className="wf-entity-grid">
                      {currentStep.preview.extracted.map((item) => (
                        <div className="wf-entity-item" key={item.label}>
                          <small>{item.label}</small>
                          <strong>{item.val}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="wf-sentiment-row">
                      <CheckCircle2 size={14} className="text-emerald" />
                      <span>Commercial Intent: <strong>{currentStep.preview.sentiment}</strong></span>
                    </div>
                  </div>
                )}

                {/* STEP 3: Qualification */}
                {active === 2 && (
                  <div className="wf-preview-qualification">
                    <div className="wf-ai-speech">
                      <small>LeadHive Autonomous Response</small>
                      <p>&ldquo;{currentStep.preview.aiReply}&rdquo;</p>
                    </div>
                    <div className="wf-checklist">
                      <small>Qualification Rules Met</small>
                      {currentStep.preview.checklist.map((item) => (
                        <div className="wf-checklist-item" key={item.text}>
                          <span className="wf-check-mark">
                            <Check size={13} />
                          </span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Lead Scoring */}
                {active === 3 && (
                  <div className="wf-preview-scoring">
                    <div className="wf-score-hero">
                      <div className="wf-score-number">
                        <strong>{currentStep.preview.score}</strong>
                        <small>/ 100</small>
                      </div>
                      <div className="wf-score-classification">
                        <span className="wf-grade-badge">
                          <TrendingUp size={14} /> {currentStep.preview.grade}
                        </span>
                        <p>{currentStep.preview.recommendation}</p>
                      </div>
                    </div>
                    <div className="wf-metrics-bars">
                      {currentStep.preview.metrics.map((m) => (
                        <div className="wf-metric-bar-item" key={m.name}>
                          <div className="wf-bar-labels">
                            <span>{m.name}</span>
                            <strong>{m.pct}%</strong>
                          </div>
                          <div className="wf-bar-track">
                            <div className="wf-bar-fill" style={{ width: `${m.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: Sales Handover */}
                {active === 4 && (
                  <div className="wf-preview-handover">
                    <div className="wf-rep-card">
                      <div className="wf-rep-avatar">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <strong>Assigned to: {currentStep.preview.rep}</strong>
                        <small>{currentStep.preview.repRole}</small>
                      </div>
                      <span className="wf-deal-badge">{currentStep.preview.dealSize}</span>
                    </div>
                    <div className="wf-handover-summary">
                      <small>Handover Executive Summary</small>
                      <p>{currentStep.preview.summary}</p>
                    </div>
                    <div className="wf-handover-actions">
                      <button type="button" className="wf-action-btn primary">
                        {currentStep.preview.actions[0]} <ChevronRight size={14} />
                      </button>
                      <button type="button" className="wf-action-btn secondary">
                        {currentStep.preview.actions[1]}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Progress Bar */}
              <div className="workflow-stage-footer">
                <div className="workflow-stage-progress-label">
                  <span>Pipeline Progress</span>
                  <strong>{((active + 1) / workflowSteps.length) * 100}% Complete</strong>
                </div>
                <div className="workflow-stage-progress-track">
                  <div
                    className="workflow-stage-progress-fill"
                    style={{ width: `${((active + 1) / workflowSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}