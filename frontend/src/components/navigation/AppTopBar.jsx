import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * @component AppTopBar
 * @description Mobile-first top app bar with title, subtitle, network badge, inline actions, and overflow menu.
 */
function AppTopBar({
  title,
  subtitle,
  inlineActions,
  className,
  isOffline,
  onMenuToggle,
  isMenuOpen,
  hasMenu,
  palette,
}) {
  const statusLabel = isOffline ? 'Offline' : 'Online';
  const statusClasses = isOffline
    ? palette?.statusOffline ?? 'bg-rose-500/25 text-rose-100 border border-rose-400/40'
    : palette?.statusOnline ?? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/30';
  const iconWrap = palette?.iconWrap ?? 'border-white/10 bg-slate-900/80';
  const accentText = palette?.accentText ?? 'text-slate-50';
  const headerBase = palette?.topbar ?? 'bg-slate-950/90 border-white/10';
  const menuHover = palette?.menuHover ?? 'hover:border-cyan-400/40';

  return (
    <header
      className={twMerge(
        'sticky top-0 z-40 flex min-h-[56px] items-center justify-between gap-3 px-4 pb-2 pt-[calc(env(safe-area-inset-top)_+_8px)] text-slate-50 backdrop-blur-lg shadow-[0_1px_0_rgba(15,23,42,0.6)]',
        headerBase,
        className,
      )}
      role="banner"
    >
      <div className="flex flex-1 items-center gap-3">
        <div className={twMerge('flex h-10 w-10 items-center justify-center rounded-xl', iconWrap)}>
          <span className={twMerge('text-sm font-semibold tracking-wide', accentText)} aria-hidden>
            SS
          </span>
        </div>
        <div className="leading-tight">
          <p className={twMerge('text-[15px] font-semibold leading-tight', accentText)}>{title}</p>
          {subtitle ? <p className="text-[12px] font-medium text-slate-400">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={twMerge(
            'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-tight',
            statusClasses,
          )}
        >
          <span
            className={twMerge(
              'block h-1.5 w-1.5 rounded-full',
              isOffline ? 'bg-rose-200' : 'bg-emerald-200',
            )}
            aria-hidden
          />
          {statusLabel}
        </span>

        {inlineActions?.length ? (
          <nav aria-label="Page actions" className="flex items-center gap-2">
            {inlineActions.map((action, index) => (
              <Fragment key={action.key ?? index}>{action.node}</Fragment>
            ))}
          </nav>
        ) : null}

        <button
          type="button"
          onClick={onMenuToggle}
          aria-haspopup="dialog"
          aria-expanded={hasMenu ? isMenuOpen : undefined}
          aria-label={hasMenu ? 'Toggle quick actions menu' : 'No quick actions available'}
          disabled={!hasMenu}
          className={twMerge(
            'flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40',
            menuHover,
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <circle cx="5" cy="12" r="1.75" fill="currentColor" />
            <circle cx="12" cy="12" r="1.75" fill="currentColor" />
            <circle cx="19" cy="12" r="1.75" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}

AppTopBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  inlineActions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      node: PropTypes.node.isRequired,
    }),
  ),
  className: PropTypes.string,
  isOffline: PropTypes.bool,
  onMenuToggle: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  hasMenu: PropTypes.bool,
  palette: PropTypes.shape({
    topbar: PropTypes.string,
    iconWrap: PropTypes.string,
    accentText: PropTypes.string,
    statusOnline: PropTypes.string,
    statusOffline: PropTypes.string,
    menuHover: PropTypes.string,
  }),
};

AppTopBar.defaultProps = {
  subtitle: undefined,
  inlineActions: undefined,
  className: undefined,
  isOffline: false,
  onMenuToggle: undefined,
  isMenuOpen: false,
  hasMenu: false,
  palette: undefined,
};

export default AppTopBar;
