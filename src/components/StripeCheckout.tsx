'use client'

import { useState, useCallback, useEffect, useRef, SyntheticEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import posthog from 'posthog-js'
import { startCheckoutSession, type BookingMetadata } from '@/app/actions/stripe'
import { Button } from '@/components/ui/button'
import { NavArrowDownSolid } from 'iconoir-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  // Ordered list of unique year-month keys present in slots
  const months: string[] = []
  for (const s of slots) {
    const ym = s.value.slice(0, 7)
    if (!months.includes(ym)) months.push(ym)
  }

  const currentYm = visible[0]?.value.slice(0, 7) ?? months[0] ?? ''

  const jumpToMonth = (ym: string) => {
    const idx = slots.findIndex((s) => s.value.startsWith(ym))
    if (idx < 0) return
    setStart(Math.max(0, Math.min(Math.max(0, slots.length - WINDOW_SIZE), idx)))
  }

  const jumpToToday = () => {
    const today = new Date().toISOString().slice(0, 10)
    const idx = slots.findIndex((s) => s.value >= today)
    const target = idx >= 0 ? idx : slots.length - 1
    setStart(
      Math.max(0, Math.min(Math.max(0, slots.length - WINDOW_SIZE), target - Math.floor(WINDOW_SIZE / 2))),
    )
  }

  const monthLabel = currentYm
    ? new Date(currentYm + '-01T00:00:00Z').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : ''

  if (loading) return <p className="text-muted-foreground py-4 text-sm">Loading available dates…</p>
  if (!slots.length)
    return <p className="text-muted-foreground py-4 text-sm">No dates available yet. Check back soon.</p>

  return (
    <div className="space-y-3">
      {/* Nav row */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          shape="circle"
          size="icon-lg"
          onClick={() => setStart((s) => Math.max(0, s - WINDOW_SIZE))}
          disabled={!canPrev}
          aria-label="Previous dates"
        >
          <NavArrowLeft className="h-5 w-5" />
        </Button>

        {/* Month dropdown + Today */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" type="button" className="">
                {monthLabel}
                <NavArrowDownSolid className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-40">
              <DropdownMenuRadioGroup value={currentYm} onValueChange={jumpToMonth}>
                {months.map((ym) => (
                  <DropdownMenuRadioItem key={ym} value={ym} className="text-sm">
                    {new Date(ym + '-01T00:00:00Z').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" type="button" onClick={jumpToToday} className="hover:bg-none">
            Today
          </Button>
        </div>

        <Button
          variant="ghost"
          type="button"
          shape="circle"
          onClick={() => setStart((s) => Math.min(slots.length - WINDOW_SIZE, s + WINDOW_SIZE))}
          disabled={!canNext}
          aria-label="Next dates"
          className="rounded-lg p-1.5 transition-colors hover:bg-transparent disabled:opacity-30"
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
            <button
              key={slot.value}
              type="button"
              disabled={slot.isFull}
              aria-pressed={isSelected}
              aria-label={`${weekday} ${month} ${day} — ${slot.isFull ? 'full' : `${slot.spotsLeft} spot${slot.spotsLeft === 1 ? '' : 's'} left`}`}
              onClick={() => !slot.isFull && onSelect(slot.value)}
              className={`group bg-white hover:bg-secondary/20 relative flex aspect-4/3 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-xl border px-4 py-3 transition-all duration-150 ${
                slot.isFull
                  ? 'border-border cursor-not-allowed opacity-35'
                  : isSelected
                    ? 'border-border bg-secondary text-foreground hover:bg-secondary/90'
                    : 'border-border hover:border-border/70 text-foreground'
              }`}
            >
              {isSelected && (
                <span className="absolute top-4 right-4 size-3 rounded-full bg-white" aria-hidden="true" />
              )}
              <span
                className={`text-[13px] font-medium tracking-widest uppercase ${isSelected ? 'text-white' : 'text-foreground/60'}`}
              >
                {weekday}
              </span>
              <span
                className={`text-2xl leading-none font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}
              >
                {day}
              </span>
              <span
                className={`text-[14px] tracking-widest uppercase ${isSelected ? 'text-white' : 'text-foreground/60'}`}
              >
                {month}
              </span>
              <span
                className={`mt-0.5 text-[11px] ${isSelected ? 'text-white/40' : 'text-foreground/40'}`}
                aria-hidden="true"
              >
                {slot.isFull ? 'Full' : `${slot.spotsLeft} available`}
              </span>
            </button>
          )
        })}
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
    posthog.capture('booking_package_selected', {
      package_slug: formData.packageSlug,
      site_slug: 'txchristmaslights',
    })
    goTo(2)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateInfo()) {
      posthog.identify(formData.email, { email: formData.email, name: formData.name })
      posthog.capture('booking_info_submitted', {
        package_slug: formData.packageSlug,
        site_slug: 'txchristmaslights',
      })
      goTo(3)
    }
  }

  const handleDateSubmit = () => {
    if (validateDate()) {
      posthog.capture('booking_checkout_started', {
        package_slug: formData.packageSlug,
        install_date: formData.installDate,
        site_slug: 'txchristmaslights',
      })
      setShowCheckout(true)
    }
  }

  const fetchClientSecret = useCallback(() => startCheckoutSession('deposit', formData), [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    posthog.capture('booking_date_selected', {
      install_date: value,
      package_slug: formData.packageSlug,
      site_slug: 'txchristmaslights',
    })
  }

  if (isComplete) {
    return (
      <section className="bg-foreground text-background flex min-h-screen place-items-center justify-center">
        <div className="mx-auto max-w-lg space-y-6 px-8 text-center">
          <p className="text-background/60 text-sm tracking-[0.2em] uppercase">You&apos;re booked</p>
          <h2 className="font-serif text-5xl leading-[1.05] tracking-normal md:text-6xl">
            See you on
            <br />
            <span className="italic">
              {slots.find((d) => d.value === formData.installDate)?.label ?? 'November'}.
            </span>
          </h2>
          <p className="text-background/70 mx-auto max-w-md text-lg">
            Your deposit is confirmed. You&apos;ll receive an invoice at {formData.email} with the remaining
            balance — payment is due by October 1st.
          </p>
          <p className="text-background/60 mx-auto max-w-md text-sm">
            We&apos;ll also reach out a few days before your install window to confirm details.
          </p>
          <p className="text-background/40 text-xs">Deposit receipt sent to {formData.email}</p>
        </div>
      </section>
    )
  }

  if (showCheckout) {
    return (
      <section className="bg-primary text-background">
        <div className="grid lg:grid-cols-2">
          {/* Left: Summary */}
          <div className="grid grid-cols-1 place-content-center px-12 py-16 lg:px-30 lg:py-24">
            <p className="text-background/60 mb-8 text-sm tracking-[0.2em] uppercase">Confirm & Pay</p>
            <h2 className="mb-12 font-serif text-4xl leading-[1.1] tracking-normal md:text-5xl lg:text-6xl">
              Almost
              <br />
              there.
            </h2>

            <div className="mb-12 space-y-6">
              <div className="border-background/20 border-b pb-4">
                <span className="text-background/50 text-xs tracking-[0.15em] uppercase">Name</span>
                <p className="mt-1 text-xl">{formData.name}</p>
              </div>
              <div className="border-background/20 border-b pb-4">
                <span className="text-background/50 text-xs tracking-[0.15em] uppercase">Email</span>
                <p className="mt-1 text-xl">{formData.email}</p>
              </div>
              <div className="border-background/20 border-b pb-4">
                <span className="text-background/50 text-xs tracking-[0.15em] uppercase">Property</span>
                <p className="mt-1 text-xl">{formData.address}</p>
              </div>
              <div className="border-background/20 border-b pb-4">
                <span className="text-background/50 text-xs tracking-[0.15em] uppercase">Install Date</span>
                <p className="mt-1 text-xl">{slots.find((d) => d.value === formData.installDate)?.label}</p>
              </div>
            </div>

            
          </div>

          {/* Right: Checkout */}
          <div className="bg-white w-full text-foreground flex place-content-center place-items-stretch p-8 lg:p-16">
            <Button
              variant="ghost"
              pill={false}
              fullWidth={false}
              onClick={() => setShowCheckout(false)}
              className="text-foreground justify-start self-start text-sm hover:bg-none mb-8"
            >
              <ArrowLeft className="size-4" />
              Edit details
            </Button>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  fetchClientSecret,
                  onComplete: () => {
                    posthog.capture('booking_completed', {
                      package_slug: formData.packageSlug,
                      install_date: formData.installDate,
                      site_slug: 'txchristmaslights',
                    })
                    setIsComplete(true)
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
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
    },
    {
      slug: 'xmas-full-front',
      name: 'Full Front',
      description: 'Roofline plus front walkways',
    },
    {
      slug: 'xmas-full-property',
      name: 'Full Property',
      description: 'Full front and rear',
    },
  ]

  // Left text per step — updates in place, no animation
  const leftText = {
    1: {
      num: '01',
      eyebrow: 'Step 1 of 3 — Choose your package',
      heading: (
        <>
          {`Chose your`}
          <br />
          <span className="italic">package.</span>
        </>
      ),
      sub: 'All packages include installation, mid-season service, and January takedown.',
    },
    2: {
      num: '02',
      eyebrow: 'Step 2 of 3 — Your details',
      heading: (
        <>
          {`Let's start`}
          <br />
          <span className="italic">planning.</span>
        </>
      ),
      sub: "Tell us about your property and we'll get your install on the calendar.",
    },
    3: {
      num: '03',
      eyebrow: 'Step 3 of 3 — Pick your date',
      heading: (
        <>
          {`When works`}
          <br />
          <span className="italic">for you?</span>
        </>
      ),
      sub: null,
    },
  } as const

  const lt = leftText[step]

  return (
    <section className="bg-primary text-background min-h-[70vh]">
      <div className="grid h-full min-h-[70vh] items-stretch overflow-hidden md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-[.9fr_1.1fr]">
        {/* ── Left: static, text updates in place ──────────────────────── */}
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div
        key={step}
        custom={direction}
        variants={
          {
            enter: { opacity: 0 },
            center: {  opacity: 1 },
            exit: { opacity: 0 },
          }
        }
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.24, ease: [0.32, 0, 0.67, 0] }}
        className="relative flex flex-col justify-center overflow-hidden px-8 py-16 md:px-20 lg:px-30 lg:py-24">
          <span
            className="text-background/10 pointer-events-none absolute top-1/2 -left-8 -translate-y-1/2 font-serif text-[20rem] leading-none select-none lg:text-[28rem]"
            aria-hidden="true"
          >
            {lt.num}
          </span>
          <div className="relative z-10">
            <p className="text-background mb-8 text-sm tracking-[0.2em] uppercase">{lt.eyebrow}</p>
            <h2 className="mb-8 font-serif text-4xl leading-[0.95] tracking-normal md:text-5xl lg:text-6xl">
              {lt.heading}
            </h2>
            {lt.sub && <div className="text-background mb-8 max-w-md text-lg">{lt.sub}</div>}
            {step === 1 && (
            <div className="border-background/20 mb-8 inline-flex items-baseline gap-4 border-t pt-8">
              <span className="text-background/50 text-sm tracking-[0.15em] uppercase">Deposit</span>
              <span className="font-serif text-5xl lg:text-6xl">
                {fmtCents(depositAmountCents, depositCurrency)}
              </span>
            </div>
            )}
            {step === 3 && (
              <div className="mb-10 space-y-4">
                <div className="border-background/50 border-b pb-3">
                  <span className="text-background text-xs tracking-[0.15em] uppercase">Name</span>
                  <p className="mt-0.5 text-lg">{formData.name}</p>
                </div>
                <div className="border-background/50 border-b pb-3">
                  <span className="text-background text-xs tracking-[0.15em] uppercase">Property</span>
                  <p className="mt-0.5 text-lg">{formData.address}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </AnimatePresence>
        {/* ── Right: slides on step change ─────────────────────────────── */}
        <div className="bg-background h-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * 200, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -200, opacity: 0 }),
              }}
              initial={false}
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.32, 0, 0.67, 0] }}
              className="bg-background grid h-full place-items-center overflow-hidden"
            >
              {/* Step 1: package cards */}
              {step === 1 && (
                <div className="mx-auto grid h-full w-full grid-cols-1 place-content-center gap-3 space-x-3 px-5 py-10 md:px-10 md:py-20 lg:px-20 xl:px-40">
                  {PACKAGES.map((pkg) => {
                    const isSelected = formData.packageSlug === pkg.slug
                    return (
                      <Button
                        variant="outline"
                        key={pkg.slug}
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({ ...p, packageSlug: pkg.slug }))
                          setErrors((e) => ({ ...e, packageSlug: undefined }))
                        }}
                        className={`hover:bg-secondary/20 relative w-full content-end justify-start rounded-2xl border-2 px-4 py-5 text-left transition-all duration-150 ${isSelected ? 'border-secondary bg-secondary hover:bg-secondary/90 border text-white' : 'border'}`}
                      >
                        <div className="grid grid-cols-1 content-end">
                          <div
                            className={`absolute top-3 right-3 flex size-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-foreground bg-foreground' : 'border-foreground/40'}`}
                          >
                            {isSelected && <span className="bg-background size-2 rounded-full" />}
                          </div>
                          <span
                            className={`mb-1 font-serif text-[1.5rem] leading-none whitespace-pre-line ${isSelected ? 'text-white' : 'text-foreground'}`}
                          >
                            {pkg.name}
                          </span>
                          <span
                            className={`text-lg font-normal whitespace-pre-line ${isSelected ? 'text-white/60' : 'text-foreground/60'}`}
                          >
                            {pkg.description}
                          </span>
                          {packagePrices[pkg.slug] && (
                            <p className={`mt-1.5 text-lg ${isSelected ? 'text-white' : 'text-foreground'}`}>
                              {fmtCents(packagePrices[pkg.slug], depositCurrency)}
                            </p>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                  {errors.packageSlug && (
                    <p className="text-background/70 pt-1 text-sm" role="alert">
                      {errors.packageSlug}
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={handlePackageSubmit}
                    className="col-start-1 col-end-1 mt-4 h-16 w-full"
                  >
                    Continue <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: contact form on white */}
              {step === 2 && (
                <div className="mx-auto grid w-full grid-cols-1 place-items-start gap-6 space-x-3 px-5 py-10 md:px-10 md:py-20 lg:px-20 xl:px-40">
                  <Button
                    variant="ghost"
                    pill={false}
                    fullWidth={false}
                    onClick={() => goTo(1)}
                    className="hover:bg-background text-secondary hover:text-secondary/90 justify-start px-0"
                  >
                    <ArrowLeft className="size-4" /> Back to packages
                  </Button>
                  <form
                    onSubmit={handleSubmit}
                    className="mx-auto grid w-full max-w-lg min-w-full items-center space-y-4"
                  >
                    <div className="relative">
                      <label
                        htmlFor="name"
                        className={`pointer-events-none text-xs tracking-[0.15em] uppercase ${focusedField === 'name' || formData.name ? 'text-muted-foreground' : 'text-foreground/60 '}`}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="border-border text-foreground focus:border-foreground w-full border-b-2 bg-transparent py-4 text-lg transition-colors focus:outline-none"
                      />
                      {errors.name && <p className="mt-2 text-sm">{errors.name}</p>}
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className={`pointer-events-none text-xs tracking-[0.15em] uppercase ${focusedField === 'email' || formData.email ? 'text-muted-foreground' : 'text-foreground/60 '}`}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="border-border text-foreground focus:border-foreground w-full border-b-2 bg-transparent py-4 text-lg transition-colors focus:outline-none"
                      />
                      {errors.email && <p className="text-muted-foreground mt-2 text-sm">{errors.email}</p>}
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="address"
                        className={`pointer-events-none text-xs tracking-[0.15em] uppercase ${focusedField === 'address' || formData.address ? 'text-muted-foreground' : 'text-foreground/60 '}`}
                      >
                        Property Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('address')}
                        onBlur={() => setFocusedField(null)}
                        className="border-border text-foreground focus:border-foreground w-full border-b-2 bg-transparent py-4 text-lg transition-colors focus:outline-none"
                      />
                      {errors.address && (
                        <p className="text-muted-foreground mt-2 text-sm">{errors.address}</p>
                      )}
                    </div>
                    <Button type="submit" fullWidth className="mt-8 h-16">
                      Choose a date <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </div>
              )}

              {/* Step 3: date grid on red */}
              {step === 3 && (
                <div className="mx-auto grid w-full grid-cols-1 place-items-stretch gap-6 space-x-3 px-5 py-10 md:px-10 md:py-20 lg:px-20 xl:px-40">
                  <Button
                    variant="ghost"
                    pill={false}
                    fullWidth={false}
                    onClick={() => goTo(2)}
                    className="hover:bg-background text-secondary hover:text-secondary/90 justify-start px-0"
                  >
                    <ArrowLeft className="size-4" /> Edit details
                  </Button>
                  <fieldset>
                    <legend className="text-foreground mb-6 text-xs tracking-[0.2em] uppercase">
                      Select your install window
                    </legend>
                    <SlidingDateGrid
                      slots={slots}
                      selected={formData.installDate}
                      onSelect={handleDateSelect}
                      loading={slotsLoading}
                    />
                    {errors.installDate && (
                      <p className="text-background/70 mt-3 text-sm" role="alert">
                        {errors.installDate}
                      </p>
                    )}
                  </fieldset>
                  <Button
                    variant="default"
                    type="button"
                    fullWidth
                    onClick={handleDateSubmit}
                    disabled={!formData.installDate}
                    className="h-16"
                  >
                    Continue to payment <ArrowRight className="size-4" />
                  </Button>
                  <p className="text-background/50 mt-4 text-center text-sm">
                    {fmtCents(depositAmountCents, depositCurrency)} deposit applied to your final balance on
                    install day.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
