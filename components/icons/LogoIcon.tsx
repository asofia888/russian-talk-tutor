import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <clipPath id="logo-clip-path-for-icon">
                <rect width="40" height="40" rx="8" />
            </clipPath>
        </defs>
        <g clipPath="url(#logo-clip-path-for-icon)">
            <rect width="40" height="40" fill="#00247D" />
            <rect x="0" y="0" width="40" height="6.67" fill="#EF3340" />
            <rect x="0" y="33.33" width="40" height="6.67" fill="#EF3340" />
            <rect x="0" y="6.67" width="40" height="6.67" fill="#FFFFFF" />
            <rect x="0" y="26.66" width="40" height="6.67" fill="#FFFFFF" />
        </g>
        <path
            d="M13.5 21.5C13.5 22.3284 14.1716 23 15 23H22.7929L26.5 26.7071V23H25C25.8284 23 26.5 22.3284 26.5 21.5V16.5C26.5 15.6716 25.8284 15 25 15H15C14.1716 15 13.5 15.6716 13.5 16.5V21.5Z"
            fill="white"
            fillOpacity="0.95"
        />
    </svg>
);

export default LogoIcon;