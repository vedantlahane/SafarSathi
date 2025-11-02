import { NavLink } from 'react-router-dom';
import { HomeIcon, MapPinIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

const tabs = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
  },
  {
    to: '/map',
    label: 'Map',
    icon: MapPinIcon,
  },
  {
    to: '/safety',
    label: 'SOS',
    icon: ShieldCheckIcon,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: UserIcon,
  },
];

function AppTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom sticky bottom-0 z-40 flex h-[64px] items-stretch justify-evenly border-t border-white/10 bg-slate-950/90 px-2 pb-[calc(env(safe-area-inset-bottom)_+_6px)] pt-2 text-slate-300 shadow-[0_-2px_12px_rgba(15,23,42,0.45)] backdrop-blur-lg"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            twMerge(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors',
              isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200',
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default AppTabBar;
