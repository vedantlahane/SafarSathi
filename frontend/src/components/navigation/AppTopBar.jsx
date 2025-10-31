import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * @component AppTopBar
 * @description Mobile-first top app bar with title, subtitle, and action slots.
 */
function AppTopBar({ title, subtitle, actions, className }) {
  return (
    <header
      className={twMerge(
        'sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-white/10 bg-slate-950/85 px-4 pb-2 pt-[calc(env(safe-area-inset-top)_+_6px)] text-slate-50 backdrop-blur-lg shadow-[0_1px_0_rgba(15,23,42,0.6)]',
        className,
      )}
      role="banner"
    >
      <div className="flex-1">
        <p className="text-[15px] font-semibold leading-tight">{title}</p>
        {subtitle ? <p className="text-[12px] font-medium text-slate-400">{subtitle}</p> : null}
      </div>
      {actions?.length ? (
        <nav aria-label="Page actions" className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Fragment key={action.key ?? index}>{action.node}</Fragment>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

AppTopBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      node: PropTypes.node.isRequired,
    }),
  ),
  className: PropTypes.string,
};

AppTopBar.defaultProps = {
  subtitle: undefined,
  actions: undefined,
  className: undefined,
};

export default AppTopBar;
