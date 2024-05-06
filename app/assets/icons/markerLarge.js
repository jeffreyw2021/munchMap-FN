import React from 'react';
import Svg, { G, Mask, Path, Defs, Rect, LinearGradient, Stop } from 'react-native-svg';

function SvgComponent({ size = 1, ...props }) {
    return (
        <Svg
            width={83 * size}
            height={102 * size}
            viewBox="0 0 83 102"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <G filter="url(#filter0_d_43_1903)">
                <Mask
                    id="a"
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={83}
                    height={99}
                    fill="#000"
                >
                    <Path fill="#fff" d="M0 0H83V99H0z" />
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15 4C8.925 4 4 8.925 4 15v52.167c0 6.075 4.925 11 11 11h12.177L41.083 93l13.906-14.833h12.178c6.075 0 11-4.925 11-11V15c0-6.075-4.925-11-11-11H15z"
                    />
                </Mask>
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15 4C8.925 4 4 8.925 4 15v52.167c0 6.075 4.925 11 11 11h12.177L41.083 93l13.906-14.833h12.178c6.075 0 11-4.925 11-11V15c0-6.075-4.925-11-11-11H15z"
                    fill="#D9D9D9"
                />
                <Path
                    d="M15 78.167v-4 4zm12.177 0l2.918-2.736-1.185-1.264h-1.733v4zM41.083 93l-2.918 2.736 2.918 3.112L44 95.737 41.083 93zm13.906-14.833v-4h-1.733l-1.185 1.264 2.918 2.736zm12.178 0v-4 4zM8 15a7 7 0 017-7V0C6.716 0 0 6.716 0 15h8zm0 52.167V15H0v52.167h8zm7 7a7 7 0 01-7-7H0c0 8.284 6.716 15 15 15v-8zm12.177 0H15v8h12.177v-8zM44 90.264L30.095 75.431l-5.836 5.471 13.906 14.834L44 90.264zm8.07-14.833L38.165 90.264 44 95.736l13.906-14.834-5.836-5.471zm15.096-1.264H54.989v8h12.178v-8zm7-7a7 7 0 01-7 7v8c8.284 0 15-6.716 15-15h-8zm0-52.167v52.167h8V15h-8zm-7-7a7 7 0 017 7h8c0-8.284-6.716-15-15-15v8zM15 8h52.167V0H15v8z"
                    fill="#000"
                    mask="url(#a)"
                />
            </G>
            <Mask id="b" fill="#fff">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15 4C8.925 4 4 8.925 4 15v52.167c0 6.075 4.925 11 11 11h12.177L41.083 93l13.906-14.833h12.178c6.075 0 11-4.925 11-11V15c0-6.075-4.925-11-11-11H15z"
                />
            </Mask>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15 4C8.925 4 4 8.925 4 15v52.167c0 6.075 4.925 11 11 11h12.177L41.083 93l13.906-14.833h12.178c6.075 0 11-4.925 11-11V15c0-6.075-4.925-11-11-11H15z"
                fill="#fff"
            />
            <Path
                d="M15 78.167v-4 4zm12.177 0l2.918-2.736-1.185-1.264h-1.733v4zM41.083 93l-2.918 2.736 2.918 3.112 2.918-3.112L41.083 93zm13.906-14.833v-4h-1.733l-1.185 1.264 2.918 2.736zm12.178 0v-4 4zM8 15a7 7 0 017-7V0C6.716 0 0 6.716 0 15h8zm0 52.167V15H0v52.167h8zm7 7a7 7 0 01-7-7H0c0 8.284 6.716 15 15 15v-8zm12.177 0H15v8h12.177v-8zM44 90.264L30.095 75.431l-5.836 5.471 13.906 14.834L44 90.264zm8.07-14.833L38.165 90.264 44 95.736l13.906-14.834-5.836-5.471zm15.096-1.264H54.989v8h12.178v-8zm7-7a7 7 0 01-7 7v8c8.284 0 15-6.716 15-15h-8zm0-52.167v52.167h8V15h-8zm-7-7a7 7 0 017 7h8c0-8.284-6.716-15-15-15v8zM15 8h52.167V0H15v8z"
                fill="url(#paint0_linear_43_1903)"
                mask="url(#b)"
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_43_1903"
                    x1={4}
                    y1={48.5}
                    x2={78.1666}
                    y2={48.5}
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop stopColor="#98FF47" />
                    <Stop offset={1} stopColor="#D0FF6B" />
                </LinearGradient>
            </Defs>
        </Svg>
    )
}

export default SvgComponent
