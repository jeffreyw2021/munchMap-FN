import * as React from "react"
import Svg, { G, Mask, Path, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent({ size = 1, ...props }) {

  const sizeRatio = size;
  return (
    <Svg
      width={44 * sizeRatio}
      height={56 * sizeRatio}
      viewBox="0 0 44 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_d_16_478)">
        <Mask
          id="a"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={44}
          height={53}
          fill="#000"
        >
          <Path fill="#fff" d="M0 0H44V53H0z" />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13 2C6.925 2 2 6.925 2 13v18c0 6.075 4.925 11 11 11h1.5l7.5 8 7.5-8H31c6.075 0 11-4.925 11-11V13c0-6.075-4.925-11-11-11H13z"
          />
        </Mask>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 2C6.925 2 2 6.925 2 13v18c0 6.075 4.925 11 11 11h1.5l7.5 8 7.5-8H31c6.075 0 11-4.925 11-11V13c0-6.075-4.925-11-11-11H13z"
          fill="#D9D9D9"
        />
        <Path
          d="M14.5 42l1.46-1.368-.594-.632H14.5v2zm7.5 8l-1.46 1.368L22 52.924l1.46-1.556L22 50zm7.5-8v-2h-.866l-.593.632L29.5 42zM4 13a9 9 0 019-9V0C5.82 0 0 5.82 0 13h4zm0 18V13H0v18h4zm9 9a9 9 0 01-9-9H0c0 7.18 5.82 13 13 13v-4zm1.5 0H13v4h1.5v-4zm8.96 8.632l-7.5-8-2.92 2.736 7.5 8 2.92-2.736zm4.58-8l-7.5 8 2.92 2.736 7.5-8-2.92-2.736zM31 40h-1.5v4H31v-4zm9-9a9 9 0 01-9 9v4c7.18 0 13-5.82 13-13h-4zm0-18v18h4V13h-4zm-9-9a9 9 0 019 9h4c0-7.18-5.82-13-13-13v4zM13 4h18V0H13v4z"
          fill="#000"
          mask="url(#a)"
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 2C6.925 2 2 6.925 2 13v18c0 6.075 4.925 11 11 11h1.5l7.5 8 7.5-8H31c6.075 0 11-4.925 11-11V13c0-6.075-4.925-11-11-11H13z"
        fill="#fff"
      />
      <Defs></Defs>
    </Svg>
  )
}

export default SvgComponent
