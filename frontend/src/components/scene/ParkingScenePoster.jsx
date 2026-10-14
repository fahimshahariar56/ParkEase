import React from 'react';

export const ParkingScenePoster = ({ className = '' }) => (
  <svg
    viewBox="0 0 640 360"
    className={`block w-full ${className}`}
    role="presentation"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="parking-poster-ground" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#24262b" />
        <stop offset="1" stopColor="#111216" />
      </linearGradient>
    </defs>
    <path d="M0 52 388 0l252 86-389 274L0 270Z" fill="url(#parking-poster-ground)" />
    <path d="m106 244 290-204M183 286 472 82M260 326 550 122" fill="none" stroke="#f5f5f5" strokeOpacity=".42" strokeWidth="3" />
    <path d="m80 276 77 38m-24-108 76 38m0-92 76 38m0-92 76 38" fill="none" stroke="#f5f5f5" strokeOpacity=".24" strokeWidth="2" />
    <g transform="translate(291 177) rotate(-28)">
      <ellipse cx="0" cy="56" rx="118" ry="30" fill="#08090b" fillOpacity=".5" />
      <path d="m-112 13 19-30 44-16h86l46 22 39 12 12 24-11 29H-98l-21-17Z" fill="#d7d9dc" stroke="#f5f5f5" strokeWidth="3" />
      <path d="m-51-30 18-31h67l34 35-5 15H-62Z" fill="#34373d" stroke="#a1a1aa" strokeWidth="2" />
      <path d="m-25-54-17 25h49v-25Zm42 0v25h44L37-54Z" fill="#70747d" />
      <path d="m-111 8 26-2v17h-29m234-5-23-3v17h26" fill="#f5f5f5" />
      <g fill="#090a0c" stroke="#777b82" strokeWidth="4">
        <circle cx="-69" cy="50" r="19" />
        <circle cx="77" cy="50" r="19" />
      </g>
    </g>
  </svg>
);
