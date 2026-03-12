'use client'
import { Card } from '@/components/ui/card'
import { getDevSectionAttributes } from './dev/DevTrace'

function Ratings() {
  return (
    <div className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-current text-yellow-400"
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          className=""
        ></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-current text-yellow-400"
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          className=""
        ></path>
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 fill-current"
        data-icon-replaced="true"
        style={{ width: '16px', height: '16px', color: 'rgb(250, 204, 21)' }}
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          className=""
        ></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 fill-current"
        data-icon-replaced="true"
        style={{ width: '16px', height: '16px', color: 'rgb(250, 204, 21)' }}
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          className=""
        ></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 fill-current"
        data-icon-replaced="true"
        style={{ width: '16px', height: '16px', color: 'rgb(250, 204, 21)' }}
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          className=""
        ></path>
      </svg>
    </div>
  )
}

const Testimonials = () => {
  return (
    <section
      className="radial-grid-bg bg-secondary-100 py-24"
      {...getDevSectionAttributes({
        id: 'testimonials-homepage',
        markup: 'src/components/Testimonials.jsx',
        content: 'local JSX testimonial content',
      })}
    >
      <div className="mr-auto mb-20 ml-auto max-w-7xl text-center sm:px-6 lg:px-8">
        <h2 className="text-foreground font-display dynamic-zoom-in animate-delay-200 mb-6 text-4xl font-medium tracking-tight sm:text-6xl">
          What customers are saying
          <span className="bg-primary block bg-clip-text leading-relaxed font-medium tracking-tight text-transparent">
            about Texas Solar and Roofing Pros
          </span>
        </h2>
      </div>

      <div className="dynamic-slide-in animate-delay-400 relative mx-auto max-w-7xl px-10">
        <div className="overflow-hidden">
          <div className="testimonial-scroll grid gap-6 sm:grid-cols-1 md:grid-cols-3">
            <Card className="card--dark-glass relative p-10 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Ratings />
                <span className="ml-2 text-sm text-gray-400">5.0</span>
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "The team at Texas Solar and Roofing Pros made the entire process seamless. From the initial
                consultation to the final installation, they were professional, knowledgeable, and always on
                time. My energy bills have dropped significantly, and I couldn't be happier with my new solar
                panels!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Michael R."
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <div className="text-foreground text-lg font-semibold">Michael R.</div>
                  <div className="text-sm text-gray-400">Austin, TX</div>
                </div>
              </div>
            </Card>

            <Card className="card--dark-glass relative p-10 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Ratings />
                <span className="ml-2 text-sm text-gray-400">5.0</span>
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "After a major hailstorm, I needed a new roof and decided to add solar at the same time. The
                crew handled both projects flawlessly. They explained everything clearly, worked efficiently,
                and left my property spotless. Highly recommend for anyone considering roofing or solar!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Lisa G."
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <div className="text-foreground text-lg font-semibold">Lisa G.</div>
                  <div className="text-sm text-gray-400">Round Rock, TX</div>
                </div>
              </div>
            </Card>

            <Card className="card--dark-glass relative p-10 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Ratings />
                <span className="ml-2 text-sm text-gray-400">5.0</span>
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "I was nervous about switching to solar, but Texas Solar and Roofing Pros answered all my
                questions and provided transparent pricing. The installation was quick, and now I'm seeing
                real savings every month. Excellent service from start to finish."
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://randomuser.me/api/portraits/men/65.jpg"
                  alt="David S."
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <div className="text-foreground text-lg font-semibold">David S.</div>
                  <div className="text-sm text-gray-400">Cedar Park, TX</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
