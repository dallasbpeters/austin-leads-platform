import { cn } from '@/lib/utils'

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "flex p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)] group overflow-hidden",
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            className={cn("flex justify-around [gap:var(--gap)] shrink-0", {
              "flex-row animate-marquee": !vertical,
              "flex-col animate-marquee-vertical": vertical,
              'group-hover:[animation-play-state:paused]': pauseOnHover,
              '[animation-direction:reverse]': reverse,
            })}
            key={i}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
