import { cn } from '@/lib/utils'

const Logo = ({ className, ...props }) => (
  <svg
    className={cn(
      "h-7 w-7 text-primary [clipRule:evenodd] [fillRule:evenodd] [strokeLinejoin:round] [strokeMiterlimit:2] fill-current",
      className,
    )}
    viewBox="0 0 483 491"
    height="40"
    width="40"
    aria-hidden="true"
    {...props}
    style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
  >
    <g transform="matrix(1,0,0,1,-1117.520132,-20.022941)">
      <g transform="matrix(1,0,0,1,551.679288,0)">
        <g transform="matrix(1.122079,0,-0.363049,1.122079,-617.643357,-79.842122)">
          <path
            d="M1320.761,404.637L1152.178,301.201L1155.057,207.401L1221.488,248.161L1221.488,89L1321,89L1321,157.702L1493.193,158.064L1554.281,252.808L1381.996,252.445L1321,157.845L1321,252.808L1229.062,252.808L1325.627,312.056L1322.846,402.659L1381.781,346.744L1480.789,405.149L1419.879,311.178L1481.587,252.808L1587.731,416.563L1526.022,474.934L1481.017,405.502L1374.555,506.509L1275.177,447.885L1320.761,404.637Z"
            style={{
              fill: 'currentColor',
              fillRule: 'evenodd',
              clipRule: 'evenodd',
              strokeLinejoin: 'round',
              strokeMiterlimit: 2,
            }}
          />
        </g>
      </g>
    </g>
  </svg>
)
export default Logo
