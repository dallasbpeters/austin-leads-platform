'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession, type BookingMetadata } from '@/app/actions/stripe'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, NavArrowLeft, NavArrowRight } from 'iconoir-react'

const WINDOW_SIZE = 9

type SlotOption = {
  value: string
  label: string
  spotsLeft: number
  isFull: boolean
}

function SlidingDateGrid({
  slots,
  selected,
  onSelect,
  loading,
}: {
  slots: SlotOption[]
  selected: string
  onSelect: (v: string) => void
  loading: boolean
}) {
  const [start, setStart] = useState(0)

  // Keep selected tile in view
  useEffect(() => {
    if (!selected || !slots.length) return
    const idx = slots.findIndex((s) => s.value === selected)
    if (idx < 0) return
    if (idx < start) setStart(Math.max(0, idx))
    if (idx >= start + WINDOW_SIZE) setStart(Math.min(slots.length - WINDOW_SIZE, idx - WINDOW_SIZE + 1))
  }, [selected, slots, start])

  const visible = slots.slice(start, start + WINDOW_SIZE)
  const canPrev = start > 0
  const canNext = start + WINDOW_SIZE < slots.length

  const fmtTile = (value: string) => {
    const d = new Date(value + 'T00:00:00Z')
    return {
      month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      day: d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-4">Loading available dates…</p>
  if (!slots.length) return <p className="text-sm text-muted-foreground py-4">No dates available yet. Check back soon.</p>

  return (
    <div className="space-y-3">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          shape="circle"
          size="icon-lg"
          onClick={() => setStart((s) => Math.max(0, s - WINDOW_SIZE))}
          disabled={!canPrev}
        >
          <NavArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-xs text-black uppercase tracking-[0.18em]">
          {(() => {
            const first = new Date(visible[0]?.value + 'T00:00:00Z')
            const last = new Date(visible[visible.length - 1]?.value + 'T00:00:00Z')
            const fm = first.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
            const lm = last.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
            return fm === lm ? fm : `${fm} – ${lm}`
          })()}
        </span>
        <Button
        variant="ghost"
          type="button"
          shape="circle"
          onClick={() => setStart((s) => Math.min(slots.length - WINDOW_SIZE, s + WINDOW_SIZE))}
          disabled={!canNext}
          aria-label="Next dates"
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30 hover:bg-background/10"
        >
          <NavArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 9-tile grid */}
      <div className="grid grid-cols-3 gap-2">
        {visible.map((slot) => {
          const { month, day, weekday } = fmtTile(slot.value)
          const isSelected = selected === slot.value
          return (
            <Button
            variant="outline"
              key={slot.value}
              type="button"
              disabled={slot.isFull}
              aria-pressed={isSelected}
              aria-label={`${weekday} ${month} ${day} — ${slot.isFull ? 'full' : `${slot.spotsLeft} spot${slot.spotsLeft === 1 ? '' : 's'} left`}`}
              onClick={() => !slot.isFull && onSelect(slot.value)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl border transition-all duration-150 ${
                slot.isFull
                  ? 'border-border opacity-35 cursor-not-allowed'
                  : isSelected
                    ? 'border-border bg-background text-foreground'
                    : 'border-border hover:border-border/70 text-foreground'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 size-2 bg-secondary rounded-full" aria-hidden="true" />
              )}
              <span className={`text-[10px] uppercase tracking-widest font-medium ${isSelected ? 'text-foreground/50' : 'text-foreground/60'}`}>{weekday}</span>
              <span className={`text-2xl leading-none ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{day}</span>
              <span className={`text-[10px] uppercase tracking-widest ${isSelected ? 'text-foreground/50' : 'text-foreground/60'}`}>{month}</span>
              <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-foreground/40' : 'text-foreground/40'}`} aria-hidden="true">
                {slot.isFull ? 'Full' : `${slot.spotsLeft} left`}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 pt-1" aria-hidden="true">
        {Array.from({ length: Math.ceil(slots.length / WINDOW_SIZE) }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStart(i * WINDOW_SIZE)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              Math.floor(start / WINDOW_SIZE) === i ? 'bg-background w-3' : 'bg-background/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

function fmtCents(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function SchedulingForm() {
  const [slots, setSlots] = useState<SlotOption[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [depositAmountCents, setDepositAmountCents] = useState(15000)
  const [depositCurrency, setDepositCurrency] = useState('usd')
  const [packagePrices, setPackagePrices] = useState<Record<string, number>>({
    'xmas-roofline': 30000,
    'xmas-full-front': 50000,
    'xmas-full-property': 100000,
  })

  useEffect(() => {
    fetch('/api/christmas/slots/available')
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))

    fetch('/api/christmas/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.depositAmountCents) setDepositAmountCents(data.depositAmountCents)
        if (data.currency) setDepositCurrency(data.currency)
        if (Array.isArray(data.packages)) {
          const map: Record<string, number> = {}
          data.packages.forEach((p: { id: string; amountCents: number }) => {
            map[p.id] = p.amountCents
          })
          setPackagePrices(map)
        }
      })
      .catch(() => {})
  }, [])

  const [formData, setFormData] = useState<BookingMetadata>({
    name: '',
    email: '',
    address: '',
    installDate: '',
  })
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const prevStep = useRef<number>(1)

  const goTo = (next: 1 | 2 | 3) => {
    prevStep.current = step
    setStep(next)
  }
  const [showCheckout, setShowCheckout] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errors, setErrors] = useState<Partial<BookingMetadata>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const validateInfo = () => {
    const newErrors: Partial<BookingMetadata> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.address.trim()) newErrors.address = 'Property address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDate = () => {
    if (!formData.installDate) {
      setErrors((prev) => ({ ...prev, installDate: 'Please select an install window' }))
      return false
    }
    return true
  }

  const handlePackageSubmit = () => {
    if (!formData.packageSlug) {
      setErrors((prev) => ({ ...prev, packageSlug: 'Please select a package' }))
      return
    }
    setErrors({})
    goTo(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateInfo()) goTo(3)
  }

  const handleDateSubmit = () => {
    if (validateDate()) setShowCheckout(true)
  }

  const fetchClientSecret = useCallback(
    () => startCheckoutSession('deposit', formData),
    [formData]
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof BookingMetadata]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleDateSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, installDate: value }))
    if (errors.installDate) {
      setErrors((prev) => ({ ...prev, installDate: undefined }))
    }
  }

  if (isComplete) {
    return (
      <section className="bg-foreground text-background min-h-screen flex place-items-center justify-center">
        <div className="max-w-lg mx-auto px-8 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-background/60">You&apos;re booked</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-normal">
            See you in<br />
            <span className="italic">
              {slots.find((d) => d.value === formData.installDate)?.label ?? 'November'}.
            </span>
          </h2>
          <p className="text-lg text-background/70 max-w-md mx-auto">
            Your deposit is confirmed. We&apos;ll reach out a few days before your install window to confirm details.
          </p>
          <p className="text-sm text-background/50">
            A receipt was sent to {formData.email}
          </p>
        </div>
      </section>
    )
  }

  if (showCheckout) {
    return (
      <section className="bg-primary text-background">
        <div className="grid lg:grid-cols-2">
          {/* Left: Summary */}
          <div className="px-12 py-16 lg:px-30 lg:py-24 grid grid-cols-1 place-content-center">
            <p className="text-sm uppercase tracking-[0.2em] text-background/60 mb-8">
              Confirm & Pay
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-normal mb-12">
              Almost<br />there.
            </h2>
            
            <div className="space-y-6 mb-12">
              <div className="border-b border-background/20 pb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-background/50">Name</span>
                <p className="text-xl mt-1">{formData.name}</p>
              </div>
              <div className="border-b border-background/20 pb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-background/50">Email</span>
                <p className="text-xl mt-1">{formData.email}</p>
              </div>
              <div className="border-b border-background/20 pb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-background/50">Property</span>
                <p className="text-xl mt-1">{formData.address}</p>
              </div>
              <div className="pb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-background/50">Install Window</span>
                <p className="text-xl mt-1">
                  {slots.find((d) => d.value === formData.installDate)?.label}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              pill={false}
              fullWidth={false}
              onClick={() => setShowCheckout(false)}
              className="text-sm text-background self-start justify-start"
            >
              <ArrowLeft className="size-4" />
              Edit details
            </Button>
          </div>

          {/* Right: Checkout */}
          <div className="bg-background text-foreground p-8 lg:p-16 flex place-items-center">
            <div className="w-full max-w-lg mx-auto">
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-serif text-3xl">{fmtCents(depositAmountCents, depositCurrency)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Applied to your balance on install day
                </p>
              </div>

                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ fetchClientSecret, onComplete: () => setIsComplete(true) }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Steps 1-3: persistent layout, only right panel slides ─────────────────
  const direction = step > prevStep.current ? 1 : -1
  const PACKAGES = [
    {
      slug: 'xmas-roofline',
      name: 'Roofline',
      description: 'Roofline, gutter runs, and front entry',
      price: '$400.00',
    },
    {
      slug: 'xmas-full-front',
      name: 'Full front',
      description: 'Roofline plus trees, bushes, and walkways',
      price: '$700.00',
    },
    {
      slug: 'xmas-full-property',
      name: 'Full property',
      description: 'Full front and rear — quoted on walkthrough',
      price: '$900.00',  
    },
  ]

  // Left text per step — updates in place, no animation
  const leftText = {
    1: { num: '01', eyebrow: 'Step 1 of 3 — Choose your package',
         heading: <>{`Chose your`}<br /><span className="italic">package.</span></>,
         sub: 'All packages include installation, mid-season service, and January takedown.' },
    2: { num: '02', eyebrow: 'Step 2 of 3 — Your details',
         heading: <>{`Let's start`}<br /><span className="italic">planning.</span></>,
         sub: "Tell us about your property and we'll get your install on the calendar." },
    3: { num: '03', eyebrow: 'Step 3 of 3 — Pick your date',
         heading: <>{`When works`}<br /><span className="italic">for you?</span></>,
         sub: null },
  } as const

  const lt = leftText[step]

  return (
    <section className="bg-primary text-background">
      <div className="grid lg:grid-cols-2 items-center overflow-hidden">

        {/* ── Left: static, text updates in place ──────────────────────── */}
        <div className="px-12 py-16 lg:px-30 lg:py-24 relative overflow-hidden flex flex-col justify-center">
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 font-serif text-[20rem] lg:text-[28rem] leading-none text-background/3 select-none pointer-events-none" aria-hidden="true">{lt.num}</span>
          <div className="relative z-10">
            <p className="text-sm uppercase tracking-[0.2em] text-background/60 mb-8">{lt.eyebrow}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-normal mb-8">{lt.heading}</h2>
            <div className="inline-flex items-baseline gap-4 border-t border-background/20 pt-8 mb-8">
                  <span className="text-sm uppercase tracking-[0.15em] text-background/50">Deposit</span>
                  <span className="font-serif text-5xl lg:text-6xl">{fmtCents(depositAmountCents, depositCurrency)}</span>
                </div>
            {lt.sub && <div className="text-lg text-background/70 max-w-md mb-8">{lt.sub}</div>}
            {step === 2 && (
              <>
                <Button variant="ghost" pill={false} fullWidth={false} onClick={() => goTo(1)} className="text-white hover:bg-primary hover:text-white/90 justify-start px-0">
                  <ArrowLeft className="size-4" /> Back to packages
                </Button>
              </>
            )}
            {step === 3 && (
              <div className="space-y-4 mb-10">
                <div className="border-b border-background/20 pb-3">
                  <span className="text-xs uppercase tracking-[0.15em] text-background/50">Name</span>
                  <p className="text-lg mt-0.5">{formData.name}</p>
                </div>
                <div className="border-b border-background/20 pb-3">
                  <span className="text-xs uppercase tracking-[0.15em] text-background/50">Property</span>
                  <p className="text-lg mt-0.5">{formData.address}</p>
                </div>
                <Button variant="ghost" pill={false} fullWidth={false} onClick={() => goTo(2)} className="text-white hover:text-background justify-start px-0">
                  <ArrowLeft className="size-4" /> Edit details
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: slides on step change ─────────────────────────────── */}
        <div className="bg-background overflow-hidden h-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 200, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:  (d: number) => ({ x: d * -200, opacity: 0 }),
            }}
            initial={false}
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.32, 0, 0.67, 0] }}
            className="bg-background overflow-hidden h-full"
          >
            {/* Step 1: package cards */}
            {step === 1 && (
              <div className="px-12 py-16 lg:px-30 lg:py-24">
                <div className="max-w-lg mx-auto space-y-3">
                  {PACKAGES.map((pkg) => {
                    const isSelected = formData.packageSlug === pkg.slug
                    return (
                      <Button variant="outline" key={pkg.slug} type="button"
                        onClick={() => { setFormData((p) => ({ ...p, packageSlug: pkg.slug })); setErrors((e) => ({ ...e, packageSlug: undefined })) }}
                        className={`w-full justify-start text-left px-4 py-5 rounded-2xl border-2 transition-all duration-150 ${isSelected ? 'border border-accent bg-accent/10 text-foreground' : 'border'}`}
                      >
                        <div className="flex items-start justify-start gap-4">
                          <div className={`size-5 rounded-full border shrink-0 ml-4 flex items-center justify-center ${isSelected ? 'border-foreground bg-foreground' : 'border-foreground/40'}`}>
                            {isSelected && <span className="size-2 rounded-full bg-background" />}
                          </div>
                          <div>
                            <p className={`font-serif text-2xl leading-none mb-1 ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{pkg.name}</p>
                            <p className={`text-sm ${isSelected ? 'text-foreground/60' : 'text-foreground/60'}`}>{pkg.description}</p>
                            {packagePrices[pkg.slug] && (
                              <p className={`text-md font-medium mt-1.5 ${isSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                                {fmtCents(packagePrices[pkg.slug], depositCurrency)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                  {errors.packageSlug && <p className="text-sm text-background/70 pt-1" role="alert">{errors.packageSlug}</p>}
                  <Button type="button" onClick={handlePackageSubmit}
                    className="w-full mt-4 h-16"
                  >
                    Continue <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: contact form on white */}
            {step === 2 && (
              <div className="text-foreground px-12 py-16 lg:px-30 lg:py-24 flex flex-col justify-center h-full" style={{ backgroundColor: 'oklch(0.9940 0.0041 91.4453)' }}>
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full space-y-8">
                  <div className="relative">
                    <label htmlFor="name" className={`absolute left-0 transition-all duration-200 pointer-events-none ${focusedField === 'name' || formData.name ? '-top-6 text-xs uppercase tracking-[0.15em] text-muted-foreground' : 'top-4 text-foreground/60'}`}>Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className="w-full py-4 bg-transparent border-b-2 border-border text-foreground text-lg focus:outline-none focus:border-foreground transition-colors" />
                    {errors.name && <p className="text-sm mt-2">{errors.name}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="email" className={`absolute left-0 transition-all duration-200 pointer-events-none ${focusedField === 'email' || formData.email ? '-top-6 text-xs uppercase tracking-[0.15em] text-muted-foreground' : 'top-4 text-foreground/60'}`}>Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="w-full py-4 bg-transparent border-b-2 border-border text-foreground text-lg focus:outline-none focus:border-foreground transition-colors" />
                    {errors.email && <p className="text-sm text-muted-foreground mt-2">{errors.email}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="address" className={`absolute left-0 transition-all duration-200 pointer-events-none ${focusedField === 'address' || formData.address ? '-top-6 text-xs uppercase tracking-[0.15em] text-muted-foreground' : 'top-4 text-foreground/60'}`}>Property Address</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)} className="w-full py-4 bg-transparent border-b-2 border-border text-foreground text-lg focus:outline-none focus:border-foreground transition-colors" />
                    {errors.address && <p className="text-sm text-muted-foreground mt-2">{errors.address}</p>}
                  </div>
                  <Button type="submit" fullWidth className="mt-8 h-16">
                    Choose a date <ArrowRight className="size-4" />
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: date grid on red */}
            {step === 3 && (
              <div className="px-12 py-16 lg:px-30 lg:py-24 flex flex-col justify-center">
                <fieldset>
                  <legend className="text-xs uppercase tracking-[0.2em] text-background/60 mb-6">Select your install window</legend>
                  <SlidingDateGrid slots={slots} selected={formData.installDate} onSelect={handleDateSelect} loading={slotsLoading} />
                  {errors.installDate && <p className="text-sm text-background/70 mt-3" role="alert">{errors.installDate}</p>}
                </fieldset>
                <Button variant="default" type="button" fullWidth onClick={handleDateSubmit} disabled={!formData.installDate} className="h-16">
                  Continue to payment <ArrowRight className="size-4" />
                </Button>
                <p className="text-center text-sm text-background/50 mt-4">{fmtCents(depositAmountCents, depositCurrency)} deposit applied to your final balance on install day.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
