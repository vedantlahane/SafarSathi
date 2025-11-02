import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { AppTopBar, AppTabBar } from '../navigation';

const SHELL_THEMES = {
  ocean: {
    background: 'bg-gradient-to-b from-slate-950 via-slate-950 to-[#0f172a]',
    surface: 'bg-white/[0.02]',
    topbar: 'bg-slate-950/85 border-white/10',
    iconWrap: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
    accentText: 'text-cyan-200',
    statusOnline: 'bg-cyan-500/15 text-cyan-100 border-cyan-400/40',
    statusOffline: 'bg-rose-500/20 text-rose-100 border-rose-400/50',
    menuHover: 'hover:border-cyan-400/40',
    tabBar: 'bg-slate-950/85 border-white/10',
    tabActiveLink: 'bg-cyan-500/20 text-cyan-100',
    tabInactiveLink: 'text-slate-400 hover:text-slate-200',
    tabActiveIcon: 'text-cyan-100',
    tabInactiveIcon: 'text-slate-400',
    sheet: 'border-white/10 bg-slate-950/92',
    sheetButton: 'hover:border-cyan-400/40 hover:bg-cyan-500/10',
  },
  forest: {
    background: 'bg-gradient-to-b from-slate-950 via-[#061318] to-[#071e1a]',
    surface: 'bg-white/[0.015]',
    topbar: 'bg-[#071318]/90 border-emerald-500/15',
    iconWrap: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    accentText: 'text-emerald-200',
    statusOnline: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40',
    statusOffline: 'bg-rose-500/20 text-rose-100 border-rose-400/50',
    menuHover: 'hover:border-emerald-400/40',
    tabBar: 'bg-[#071318]/85 border-emerald-500/20',
    tabActiveLink: 'bg-emerald-500/20 text-emerald-100',
    tabInactiveLink: 'text-slate-400 hover:text-slate-100',
    tabActiveIcon: 'text-emerald-100',
    tabInactiveIcon: 'text-slate-500',
    sheet: 'border-emerald-500/20 bg-[#061318]/95',
    sheetButton: 'hover:border-emerald-400/40 hover:bg-emerald-500/10',
  },
  violet: {
    background: 'bg-gradient-to-b from-[#0f0a1a] via-[#0b0620] to-[#150926]',
    surface: 'bg-white/[0.018]',
    topbar: 'bg-[#110b1e]/90 border-violet-500/20',
    iconWrap: 'border-violet-500/30 bg-violet-500/10 text-violet-100',
    accentText: 'text-violet-200',
    statusOnline: 'bg-violet-500/20 text-violet-100 border-violet-400/40',
    statusOffline: 'bg-rose-500/25 text-rose-100 border-rose-400/55',
    menuHover: 'hover:border-violet-400/40',
    tabBar: 'bg-[#110b1e]/85 border-violet-500/20',
    tabActiveLink: 'bg-violet-500/20 text-violet-100',
    tabInactiveLink: 'text-slate-400 hover:text-slate-100',
    tabActiveIcon: 'text-violet-100',
    tabInactiveIcon: 'text-slate-500',
    sheet: 'border-violet-500/20 bg-[#120824]/95',
    sheetButton: 'hover:border-violet-400/40 hover:bg-violet-500/10',
  },
  amber: {
    background: 'bg-gradient-to-b from-[#1a1303] via-[#1b1406] to-[#20160a]',
    surface: 'bg-white/[0.02]',
    topbar: 'bg-[#1b1406]/90 border-amber-500/20',
    iconWrap: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    accentText: 'text-amber-200',
    statusOnline: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
    statusOffline: 'bg-rose-500/25 text-rose-100 border-rose-400/55',
    menuHover: 'hover:border-amber-400/40',
    tabBar: 'bg-[#1b1406]/85 border-amber-500/20',
    tabActiveLink: 'bg-amber-500/25 text-amber-100',
    tabInactiveLink: 'text-slate-400 hover:text-slate-100',
    tabActiveIcon: 'text-amber-100',
    tabInactiveIcon: 'text-slate-500',
    sheet: 'border-amber-500/20 bg-[#1b1406]/95',
    sheetButton: 'hover:border-amber-400/40 hover:bg-amber-500/10',
  },
};

/**
 * @component MobileShell
 * Wraps each screen with mobile-friendly chrome: safe-area spacer, top bar, tab bar, and quick actions sheet.
 */
function MobileShell({ title, subtitle, actions, inlineActions, children, tone }) {
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const palette = SHELL_THEMES[tone] ?? SHELL_THEMES.ocean;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isMenuOpen]);

  const hasMenuItems = useMemo(() => Array.isArray(actions) && actions.length > 0, [actions]);

  const toggleMenu = () => {
    if (!hasMenuItems) return;
    setIsMenuOpen((prev) => !prev);
  };

  const handleActionSelect = (action) => {
    setIsMenuOpen(false);
    if (typeof action?.onSelect === 'function') {
      action.onSelect();
    }
  };

  return (
    <div className={twMerge('flex min-h-screen flex-col text-slate-100', palette.background)}>
      <div aria-hidden className="h-[env(safe-area-inset-top)]" />
      <div aria-hidden className="h-px w-full bg-white/5" />
      <AppTopBar
        title={title}
        subtitle={subtitle}
        inlineActions={inlineActions}
        isOffline={isOffline}
        onMenuToggle={toggleMenu}
        isMenuOpen={isMenuOpen}
        hasMenu={hasMenuItems}
        palette={palette}
      />
      <main
        id="main-content"
        className={twMerge('flex-1 overflow-y-auto px-4 pb-24 pt-4', palette.surface)}
        role="main"
      >
        {children}
      </main>
      <AppTabBar palette={palette} />

      <AnimatePresence>
        {hasMenuItems && isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Global quick actions"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className={twMerge(
                'rounded-t-3xl px-5 pb-[calc(env(safe-area-inset-bottom)_+_24px)] pt-6 shadow-[0_-20px_40px_rgba(2,6,23,0.55)]',
                palette.sheet,
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-100">Quick actions</h2>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <ul className="space-y-2">
                {actions.map((action) => (
                  <li key={action.key ?? action.label}>
                    <button
                      type="button"
                      onClick={() => handleActionSelect(action)}
                      className={twMerge(
                        'flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-slate-100 transition',
                        palette.sheetButton,
                      )}
                    >
                      {action.icon ? (
                        <span className="text-xl" aria-hidden>
                          {action.icon}
                        </span>
                      ) : null}
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-tight">{action.label}</p>
                        {action.description ? (
                          <p className="text-xs font-medium text-slate-400">{action.description}</p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

MobileShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      onSelect: PropTypes.func,
      icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    }),
  ),
  inlineActions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      node: PropTypes.node.isRequired,
    }),
  ),
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(Object.keys(SHELL_THEMES)),
};

MobileShell.defaultProps = {
  subtitle: undefined,
  actions: undefined,
  inlineActions: undefined,
  tone: 'ocean',
};

export default MobileShell;
