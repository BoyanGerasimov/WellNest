// Minimalistic SVG icons in #0d9488 color
const iconColor = '#0d9488';

export const ChartIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const LightbulbIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export const RobotIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

export const ScaleIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2M6 7l6 2M6 7l6-2m0 0l3 1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0 0l-6 2m6-2v13m0-13l-6 2m6-2l6 2" />
  </svg>
);

export const HeartIcon = ({ className = 'w-5 h-5', filled = false }) => (
  <svg className={className} fill={filled ? iconColor : 'none'} viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export const ClockIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const WarningIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export const InfoIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrophyIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export const UtensilsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

export const CameraIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const WaveIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Fork and knife icon for Breakfast, Lunch, and Dinner
export const BreakfastIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

export const LunchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

export const DinnerIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

// Chocolate bar icon for Snacks
export const SnackIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <rect x="4" y="6" width="16" height="12" rx="1" fill={iconColor} opacity="0.1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v12M12 6v12M16 6v12" />
  </svg>
);

// Search icon (magnifying glass)
export const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Fire icon - 5th flame from provided SVG (centered and zoomed for better fit)
export const FireIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill={iconColor} viewBox="820 1425 650 400" preserveAspectRatio="xMidYMid meet">
    <path d="M1328.253,1675.489c-1.083,102.182-63.515,193.524-168.348,215.135c39.975-12.498,67.576-38.486,78.303-63.651
		c14.878-34.876,4.354-82.465-28.007-99.508c-5.888,11.821-12.701,24.533-24.443,29.372c-11.753,4.85-28.571-4.579-26.09-17.652
		c1.263-6.734,6.835-11.426,11.291-16.423c11.787-13.231,17.179-32.553,14.099-50.453c-3.068-17.901-14.562-33.952-29.992-41.949
		c7.794,11.189-4.241,28.3-17.382,28.244c-13.141-0.068-23.947-11.212-30.613-23.191c-13.547-24.353-15.87-55.326-6.125-81.63
		c-32.609,20.055-52.563,61.068-49.055,100.806c1.737,19.593,8.505,40.212,1.038,58.248c-10.603,25.605-46.122,30.06-68.185,14.675
		c-22.063-15.385-32.824-43.517-38.96-70.7c-13.005,54.762-6.035,115.334,20.382,164.411c13.93,25.875,34.053,49.235,66.628,63.267
		c-139.314-42.998-158.85-201.961-139.325-291.735c14.167-65.185,38.452-103.862,70.52-130.945
		c-20.326,24.454-15.148,65.76,10.592,84.439c25.729,18.668,66.606,10.761,83.548-16.152c13.558-21.555,11.573-49.574,3.97-73.87
		c-7.614-24.307-20.269-46.844-27.229-71.321c-20.732-72.787,17.619-157.779,85.905-190.399
		c-35.26,41.024-42.344,111.826-21.961,150.988c7.478,14.37,20.416,25.131,36.343,22.153c0.09-0.011,0.192-0.034,0.282-0.056
		c27.962-5.403,47.803-36.986,40.539-64.519c54.593,34.47,77.728,111.126,51.333,170.04c-8.629,19.266-21.612,36.207-31.966,54.582
		c-6.621,11.765-11.686,26.721-9.723,40.076c2.718,18.465,20.281,33.557,38.948,33.455c16.468-0.102,42.998-15.25,32.372-56.24
		C1308.525,1573.082,1328.817,1621.629,1328.253,1675.489z"/>
  </svg>
);

// Hamburger icon for calorie intake - from provided SVG
export const HamburgerIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 15h16a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4" />
    <path d="M12 4c3.783 0 6.953 2.133 7.786 5h-15.572c.833 -2.867 4.003 -5 7.786 -5" />
    <path d="M5 12h14" />
  </svg>
);

// Waving hand icon - hollow (outline only)
export const HandWaveIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 80 80">
    <path d="M44.9005 37.3237C45.7331 38.2434 46.4829 39.4509 46.1646 39.7691C45.8464 40.0873 44.87 39.5119 44.1246 38.7621C43.3792 38.0167 41.5963 45.9503 41.422 46.3513C41.2912 46.6521 39.2163 49.0321 38.1309 51.2945C37.7691 52.0486 37.8214 54.3241 37.6862 54.4592C37.1414 55.0041 36.4483 54.9474 34.9531 53.6266C33.4579 52.3058 32.682 60.1739 34.4649 61.4163C37.5119 63.5435 43.6059 71.9958 51.6571 71.9958C60.9724 71.9958 69.5991 62.2794 69.5991 55.1479C69.5991 48.0165 67.5067 45.3138 67.6462 39.3375C67.7595 34.2767 71.4429 31.8617 71.4429 29.3335C71.4429 27.2062 68.2826 26.6875 67.2452 26.6875C65.4056 26.6875 60.6891 29.0458 60.6891 35.2531C60.6891 37.668 60.0004 39.8519 57.5288 39.8519C55.0572 39.8519 52.2979 36.4606 50.6283 33.8146"/>
    <path d="M71.4388 29.3335C71.4388 28.1784 70.5016 27.4983 69.4815 27.1147C70.7064 31.173 64.4948 31.3474 64.4948 45.1744C64.4948 59.0014 56.4435 63.0248 53.1088 63.7179C49.7741 64.4067 43.8981 64.6072 39.4257 59.1191C38.0526 57.4321 36.1913 55.6013 34.1207 53.8708C33.2445 55.3311 33.0571 60.4356 34.4651 61.4163C37.5121 63.5436 43.606 71.9958 51.6573 71.9958C60.9726 71.9958 69.5992 62.2794 69.5992 55.148C69.5992 48.0165 67.5069 45.3139 67.6464 39.3376C67.7597 34.2767 71.4388 31.8618 71.4388 29.3335Z"/>
    <path d="M34.9531 53.6267C33.458 52.3059 29.9227 48.5396 27.6212 46.6957C25.3196 44.8562 23.31 44.878 21.9282 46.9093C20.5464 48.9407 24.5742 52.5064 25.4939 53.4261C26.9019 54.8341 32.682 60.174 34.4649 61.4207"/>
    <path d="M41.422 46.351C41.2476 46.7521 40.075 47.031 37.7429 44.4941C35.9601 42.5543 31.1869 36.979 28.3709 34.4507C25.5549 31.9225 23.3667 30.885 21.5271 32.2102C19.6876 33.5353 20.7338 36.2903 22.7913 38.5919C25.337 41.4383 28.2663 44.3415 31.0692 47.1313C33.2618 49.3108 38.2268 53.9184 37.6819 54.4633"/>
    <path d="M31.0735 47.1271C33.1441 49.1846 37.6776 53.3998 37.7255 54.3283C38.3794 53.3083 37.185 50.2744 35.9208 49.2108C28.615 43.0601 21.5577 33.1432 20.6597 33.4396C20.2761 34.8825 21.2482 36.8615 22.7913 38.592C25.337 41.4342 28.2663 44.3417 31.0735 47.1271Z"/>
    <path d="M50.624 33.819C48.9545 31.173 42.1107 22.6641 40.4455 20.2492C38.776 17.8342 36.5354 17.8342 34.9836 18.9284C33.4318 20.0225 32.9697 22.2064 36.4657 26.8488C38.6714 29.7781 40.5022 32.472 44.9049 37.328L50.0224 36.9706L50.624 33.819Z"/>
    <path d="M44.1247 38.7622C43.3793 38.0168 36.7666 30.1792 35.2714 28.4966C32.4686 25.3493 28.9159 18.6058 24.6789 21.6092C22.4514 23.1872 23.6589 25.4757 24.2909 26.3955C24.923 27.3153 33.1442 36.805 33.9506 37.6071C34.7571 38.4135 41.5965 45.946 41.4265 46.347"/>
    <path d="M44.9005 37.3233C45.7026 38.2082 46.4218 39.3546 46.1952 39.7252C48.8629 37.5805 43.2223 31.2773 40.0271 27.4936C37.5555 24.5643 36.8798 20.8373 35.11 18.8408C35.0664 18.867 35.0272 18.8975 34.9836 18.9236C33.4318 20.0178 32.9697 22.2017 36.4657 26.8441C38.667 29.7734 40.5022 32.4717 44.9005 37.3233Z"/>
    <path d="M33.9462 37.6113C34.7526 38.4177 41.592 45.9502 41.422 46.3512C43.5361 43.5048 35.3411 35.1397 31.3743 30.9114C27.935 27.2454 27.3465 24.0371 23.99 22.2368C22.7433 23.7451 23.7328 25.5933 24.2864 26.3997C24.9185 27.3195 33.1441 36.8092 33.9462 37.6113Z"/>
    <path d="M26.5009 61.621C26.453 61.621 26.4007 61.6123 26.3484 61.5992C21.1 59.9994 15.4158 54.2629 14.1822 49.324C14.1124 49.0451 14.2824 48.7661 14.557 48.6963C14.836 48.6266 15.115 48.7966 15.1848 49.0712C16.3225 53.6264 21.7888 59.1232 26.6491 60.6097C26.9238 60.6925 27.0763 60.9802 26.9935 61.2548C26.9281 61.4771 26.7232 61.621 26.5009 61.621Z"/>
    <path d="M29.003 68.1292C28.9638 68.1292 28.9246 68.1249 28.8853 68.1161C24.5437 67.1048 19.4959 63.8617 15.0409 59.2149C10.8736 54.8733 8.17534 50.2526 8.00098 47.1577C7.98354 46.8743 8.20149 46.6259 8.48919 46.6128C8.77253 46.5954 9.021 46.8133 9.03408 47.101C9.19101 49.917 11.8413 54.3894 15.7863 58.5C20.1061 63.0073 24.9665 66.1415 29.1207 67.1092C29.3997 67.1746 29.5741 67.4536 29.5087 67.7325C29.452 67.9679 29.2384 68.1292 29.003 68.1292Z"/>
  </svg>
);

export const MuscleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const AppleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export const TargetIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
