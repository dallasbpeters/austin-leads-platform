/*
 * The reel studio stands on its own: no marketing chrome, no admin sidebar.
 * It is a full-screen tool, used mostly on a phone or an iPad.
 */
export const metadata = {
  title: 'Reel studio — Texas Christmas Lights',
  robots: { index: false, follow: false },
}

export default function ReelsLayout({ children }) {
  return <div className="min-h-dvh bg-[#070c15] text-white">{children}</div>
}
