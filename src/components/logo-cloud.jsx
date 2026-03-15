import { Marquee } from '@/components/magicui/marquee'
import { Logo01, Logo02, Logo03, Logo04, Logo05, Logo06 } from './logos'

const LogoCloud = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Marquee
        pauseOnHover
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-16 px-4">
          <Logo01 className="h-24 w-auto object-contain" />
          <Logo02 className="h-24 w-auto object-contain" />
          <Logo03 className="h-24 w-auto object-contain" />
          <Logo04 className="h-24 w-auto object-contain" />
          <Logo05 className="h-24 w-auto object-contain" />
          <Logo06 className="h-24 w-auto object-contain" />
        </div>
      </Marquee>
    </div>
  )
}

export default LogoCloud
