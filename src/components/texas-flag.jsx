function TexasFlag(props, height, width) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width || 100}
      height={height || 100}
      viewBox="0 0 600 600"
      aria-hidden="true"
      {...props}
    >
      <path fill="#bf0a30" d="M0 0h900v600H0z" />
      <path fill="#FFF" d="M0 0h900v300H0z" />
      <path fill="#00205B" d="M0 0h300v600H0z" />
      <g fill="#FFF" transform="translate(150 300)">
        <g id="b">
          <path id="a" d="M0-112.5V0h50" transform="rotate(18 0 -112.5)" />
          <use xlinkHref="#a" transform="scale(-1 1)" />
        </g>
        <use xlinkHref="#b" transform="rotate(72)" />
        <use xlinkHref="#b" transform="rotate(144)" />
        <use xlinkHref="#b" transform="rotate(216)" />
        <use xlinkHref="#b" transform="rotate(288)" />
      </g>
    </svg>
  )
}
export default TexasFlag
