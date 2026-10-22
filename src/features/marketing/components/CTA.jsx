import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import { Reveal } from '../../../shared/ui/Reveal'

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim()
const recaptchaConfigurationError = !recaptchaSiteKey || recaptchaSiteKey === 'PASTE_RECAPTCHA_SITE_KEY_HERE'
  ? 'reCAPTCHA is not configured. Please contact support.'
  : ''

let recaptchaScriptPromise = null

function loadRecaptchaScript() {
  if (typeof window !== 'undefined' && typeof window.grecaptcha?.render === 'function') return Promise.resolve()
  if (!recaptchaScriptPromise) {
    recaptchaScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="google.com/recaptcha/api.js"]')
      if (existing) {
        if (typeof window.grecaptcha?.render === 'function') return resolve()
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error('Failed to load Google reCAPTCHA script.')), { once: true })
        return
      }
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google reCAPTCHA script.'))
      document.head.appendChild(script)
    })
    // A transient network/CSP failure must not make future mounts permanently
    // reuse a rejected promise.
    recaptchaScriptPromise.catch(() => { recaptchaScriptPromise = null })
  }
  return recaptchaScriptPromise
}

function waitForRecaptchaReady(timeoutMs = 10000) {
  if (typeof window !== 'undefined' && typeof window.grecaptcha?.render === 'function') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const timer = window.setInterval(() => {
      if (typeof window.grecaptcha?.render === 'function') {
        window.clearInterval(timer)
        resolve()
      } else if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer)
        reject(new Error('Timed out waiting for Google reCAPTCHA.'))
      }
    }, 50)
  })
}

export function CTA() {
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const recaptchaRef = useRef(null)
  const recaptchaWidgetId = useRef(null)

  useEffect(() => {
    let cancelled = false
    if (recaptchaConfigurationError) return

    async function initRecaptcha() {
      try {
        await loadRecaptchaScript()
        await waitForRecaptchaReady()
        if (cancelled || !recaptchaRef.current || recaptchaWidgetId.current !== null || recaptchaRef.current.hasChildNodes()) return
        recaptchaWidgetId.current = window.grecaptcha?.render(recaptchaRef.current, {
          sitekey: recaptchaSiteKey,
          callback: (token) => { setCaptchaToken(token); setCaptchaError(''); setFeedback(''); setStatus('idle') },
          'expired-callback': () => setCaptchaToken(''),
          'error-callback': () => {
            setCaptchaToken('')
            setCaptchaError('reCAPTCHA could not be loaded. Please check your connection and try again.')
          },
        }) ?? null
      } catch (error) {
        console.error('[LeadHive reCAPTCHA] initialization error:', error)
        setCaptchaError('reCAPTCHA could not be loaded. Please disable content blockers and refresh the page.')
      }
    }
    initRecaptcha()
    return () => { cancelled = true }
  }, [])

  const resetCaptcha = () => {
    setCaptchaToken('')
    if (recaptchaWidgetId.current !== null && typeof window.grecaptcha?.reset === 'function') {
      try { window.grecaptcha.reset(recaptchaWidgetId.current) } catch (error) { console.error('[LeadHive reCAPTCHA] reset error:', error) }
    }
  }

  const submitDemoRequest = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return
    if (!captchaToken) {
      setStatus('error')
      setFeedback(recaptchaConfigurationError || captchaError || 'Please complete the reCAPTCHA checkbox before submitting.')
      return
    }
    setStatus('submitting')
    setFeedback('')
    const formElement = event.currentTarget
    try {
      const form = new FormData(formElement)
      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'), email: form.get('email'), company: form.get('company'),
          channels: form.get('channels'), volume: form.get('volume'), website: form.get('website'),
          recaptchaToken: captchaToken, captchaToken,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.message || "We couldn't submit your request. Please try again.")
      setStatus('success')
      setFeedback('Thank you. Your request has been received. Our team will contact you shortly.')
      formElement.reset()
      resetCaptcha()
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error && error.message.length < 150 ? error.message : "We couldn't submit your request. Please try again.")
    }
  }

  return (
    <section className="cta-section" id="contact">
      <img className="cta-watermark" src="/favicon.png" alt="" aria-hidden="true" />
      <div className="container cta-layout">
        <div className="cta-left-content">
          <Reveal><p className="cta-kicker">Ready when your team is</p></Reveal>
          <Reveal delay={.06}><h2 className="cta-headline">Turn more conversations <span>into qualified sales opportunities.</span></h2></Reveal>
          <Reveal delay={.12}><p className="cta-description">LeadHive captures customer demand, identifies commercial intent, and brings your sales team in with the context to act.</p></Reveal>
          <Reveal delay={.16}>
            <p className="cta-flow" aria-label="LeadHive workflow">
              <span>Capture</span><i>→</i>
              <span>Qualify</span><i>→</i>
              <span>Prioritize</span><i>→</i>
              <span>Handover</span>
            </p>
          </Reveal>
          <Reveal delay={.2}>
            <a className="cta-email" href="mailto:support@leadhive-ai.com?subject=LeadHive%20AI%20Demo">
              <Mail /> support@leadhive-ai.com <ArrowRight />
            </a>
          </Reveal>
        </div>

        <Reveal className="cta-panel-container" delay={.1}>
          <div className="cta-panel-wrap">
            <div className="cta-panel-inner">
              <header className="cta-panel-header">
                <h3>Book a tailored demo</h3>
                <p>Tell us about your conversation workflow and we'll tailor the walkthrough to your team.</p>
              </header>
              <form className="demo-form" onSubmit={submitDemoRequest} aria-busy={status === 'submitting'} aria-describedby="demo-form-note">
                <div className="demo-form-grid">
                  <div className="demo-form-row">
                    <label><span>Name</span><input name="name" autoComplete="name" required placeholder="Your name" disabled={status === 'submitting'} /></label>
                    <label><span>Work Email</span><input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="name@company.com" disabled={status === 'submitting'} /></label>
                  </div>
                  <label><span>Company</span><input name="company" autoComplete="organization" required placeholder="Company name" disabled={status === 'submitting'} /></label>
                  <div className="demo-form-row">
                    <label>
                      <span>Primary Channels</span>
                      <select name="channels" required defaultValue="" disabled={status === 'submitting'}>
                        <option value="" disabled>Select channels</option>
                        <option>WhatsApp</option>
                        <option>Instagram</option>
                        <option>Facebook Messenger</option>
                        <option>Website chat</option>
                        <option>Multiple channels</option>
                      </select>
                    </label>
                    <label>
                      <span>Monthly Conversation Volume</span>
                      <select name="volume" required defaultValue="" disabled={status === 'submitting'}>
                        <option value="" disabled>Select volume</option>
                        <option>Under 1,000</option>
                        <option>1,000-5,000</option>
                        <option>5,000-20,000</option>
                        <option>20,000+</option>
                      </select>
                    </label>
                  </div>
                </div>
                <label className="form-honeypot" aria-hidden="true">
                  <span>Website</span>
                  <input name="website" tabIndex={-1} autoComplete="off" disabled={status === 'submitting'} />
                </label>
                <div className="recaptcha-wrap" ref={recaptchaRef} />
                {(recaptchaConfigurationError || captchaError) && <p className="recaptcha-error" role="alert">{recaptchaConfigurationError || captchaError}</p>}
                <button className="cta-submit-button" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending request...' : 'Schedule My Demo'} <ArrowRight />
                </button>
                <p className="form-note" id="demo-form-note"><Mail /> Your details are used only to arrange your LeadHive AI demo.</p>
                <div className={`form-feedback-box${feedback ? (status === 'success' ? ' is-success' : ' is-error') : ''}`} role="status" aria-live="polite">
                  {feedback && (
                    status === 'success'
                      ? <span><CheckCircle2 />{feedback}</span>
                      : <span><AlertCircle />{feedback}</span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
