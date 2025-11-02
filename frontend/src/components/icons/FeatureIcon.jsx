import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const ICON_PATHS = {
  dashboard: (
    <>
      <path d="M4 13h16" />
      <path d="M10 3v6" />
      <path d="M14 3v3" />
      <path d="M5 21h14a1 1 0 0 0 1-1v-7H4v7a1 1 0 0 0 1 1z" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 4 6.5v14L9 18l6 2.5 5-2.5v-14L15 6.5z" />
      <path d="M9 4v14" />
      <path d="M15 6.5v14" />
    </>
  ),
  sos: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </>
  ),
  share: (
    <>
      <circle cx="7.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="7.5" r="2.5" />
      <path d="m9.7 14.3 4.6-4.6" />
    </>
  ),
  contacts: (
    <>
      <path d="M15.5 3.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
      <path d="M4.5 18.5a5.5 5.5 0 0 1 11 0" />
      <path d="M20 14v4a2 2 0 0 1-2 2h-2" />
      <path d="M20 10h-3" />
    </>
  ),
  id: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M13.5 10h4" />
      <path d="M13.5 14h3" />
    </>
  ),
  safety: (
    <>
      <path d="M12 3 5 6v6c0 4.418 3.134 8.03 7 9 3.866-.97 7-4.582 7-9V6z" />
      <path d="M9.5 11.5 11.5 13.5 14.5 9.5" />
    </>
  ),
  timeline: (
    <>
      <path d="M6 6h12" />
      <path d="M6 12h12" />
      <path d="M6 18h12" />
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
    </>
  ),
  devices: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 7h2" />
      <path d="M10 17h4" />
    </>
  ),
  police: (
    <>
      <path d="M12 3 14.5 7.5 19.5 8.2 16 11.6 16.9 16.5 12 14 7.1 16.5 8 11.6 4.5 8.2 9.5 7.5 12 3z" />
    </>
  ),
  tourism: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V10" />
      <path d="M18 20V10" />
      <path d="M3 10h18" />
      <path d="M12 4l7 6H5z" />
    </>
  ),
  family: (
    <>
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="15" cy="11" r="2" />
      <path d="M4.5 19.5a4.5 4.5 0 0 1 9 0" />
      <path d="M13.5 19.5h6" />
    </>
  ),
  medical: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </>
  ),
  wearable: (
    <>
      <rect x="7" y="6" width="10" height="12" rx="2" />
      <path d="M9 3h6" />
      <path d="M9 21h6" />
      <path d="M10.5 12h3" />
    </>
  ),
  gps: (
    <>
      <path d="M12 5a7 7 0 0 0-7 7c0 3 2.2 5.9 7 9 4.8-3.1 7-6 7-9a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  satellite: (
    <>
      <path d="M5 5 19 19" />
      <path d="m12 8 4-4 4 4-4 4" />
      <path d="m8 12-4 4 4 4 4-4" />
      <path d="M15 9l-6 6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 20h18z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  default: (
    <>
      <circle cx="12" cy="12" r="7" />
    </>
  ),
};

const baseSvgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function FeatureIcon({ name, className, bare, size }) {
  const icon = ICON_PATHS[name] ?? ICON_PATHS.default;
  const sizeClasses = size === 'sm' ? 'h-8 w-8' : size === 'xs' ? 'h-7 w-7' : 'h-9 w-9';

  if (bare) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={twMerge('h-5 w-5', className)}
        {...baseSvgProps}
      >
        {icon}
      </svg>
    );
  }

  return (
    <span
      className={twMerge(
        'flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100',
        sizeClasses,
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...baseSvgProps}>
        {icon}
      </svg>
    </span>
  );
}

FeatureIcon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  bare: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md']),
};

FeatureIcon.defaultProps = {
  className: undefined,
  bare: false,
  size: 'md',
};

export default FeatureIcon;
