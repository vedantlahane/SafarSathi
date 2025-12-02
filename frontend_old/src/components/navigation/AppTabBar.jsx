import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import FeatureIcon from '../icons/FeatureIcon';

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/safety', label: 'SOS', icon: 'sos' },
  { to: '/id', label: 'ID', icon: 'id' },
];

function AppTabBar({ palette }) {
  const location = useLocation();
  const activePath = location.pathname;
  const barBackground = palette?.tabBar ?? 'bg-slate-950/90 border-white/10';
  const activeLinkClasses = palette?.tabActiveLink ?? 'text-cyan-300';
  const inactiveLinkClasses = palette?.tabInactiveLink ?? 'text-slate-400 hover:text-slate-200';
  const activeIconClass = palette?.tabActiveIcon ?? 'text-cyan-100';
  const inactiveIconClass = palette?.tabInactiveIcon ?? 'text-slate-400';

  return (
    <nav
      aria-label="Primary"
      data-shell-tabbar
      className={twMerge(
        'safe-bottom sticky bottom-0 z-40 flex h-[64px] items-stretch justify-evenly px-2 pb-[calc(env(safe-area-inset-bottom)_+_6px)] pt-2 text-slate-300 shadow-[0_-2px_12px_rgba(15,23,42,0.45)] backdrop-blur-lg',
        barBackground,
      )}
    >
      {tabs.map(({ to, label, icon }) => {
        const isActive = activePath === to;
        return (
          <Link
            key={to}
            to={to}
            className={twMerge(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors',
              isActive ? activeLinkClasses : inactiveLinkClasses,
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <FeatureIcon
              name={icon}
              bare
              className={twMerge('h-5 w-5', isActive ? activeIconClass : inactiveIconClass)}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

AppTabBar.propTypes = {
  palette: PropTypes.shape({
    tabBar: PropTypes.string,
    tabActiveLink: PropTypes.string,
    tabInactiveLink: PropTypes.string,
    tabActiveIcon: PropTypes.string,
    tabInactiveIcon: PropTypes.string,
  }),
};

AppTabBar.defaultProps = {
  palette: undefined,
};

export default AppTabBar;
