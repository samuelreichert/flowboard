import { Button } from '@base-ui/react/button';
import type { ReactNode } from 'react';

type SidebarNavItem = {
  active?: boolean;
  ariaLabel?: string;
  icon: ReactNode;
  id: string;
  label: string;
  onClick: () => void;
  title?: string;
  variant?: 'default' | 'danger';
};

type SidebarBrand = {
  iconSrc: string;
  text: string;
};

type SidebarProps = {
  ariaLabel: string;
  brand: SidebarBrand;
  closeIcon: ReactNode;
  closeLabel: string;
  collapseIcon: ReactNode;
  collapseLabel: string;
  expandIcon: ReactNode;
  expandLabel: string;
  expanded: boolean;
  footer: ReactNode;
  footerLabel?: string;
  navAriaLabel: string;
  navItems: SidebarNavItem[];
  onClose: () => void;
  onToggle: () => void;
};

const Sidebar = ({
  ariaLabel,
  brand,
  closeIcon,
  closeLabel,
  collapseIcon,
  collapseLabel,
  expandIcon,
  expandLabel,
  expanded,
  footer,
  footerLabel,
  navAriaLabel,
  navItems,
  onClose,
  onToggle,
}: SidebarProps) => (
  <aside
    aria-label={ariaLabel}
    className="app-sidebar"
    data-expanded={expanded}
  >
    <div className="app-sidebar__header">
      <Button
        aria-label={expanded ? collapseLabel : expandLabel}
        className="icon-button app-sidebar__toggle"
        onClick={onToggle}
        type="button"
      >
        {expanded ? collapseIcon : expandIcon}
      </Button>
      <div className="app-sidebar__brand">
        <img
          alt=""
          aria-hidden="true"
          className="app-sidebar__brand-icon"
          src={brand.iconSrc}
        />
        <span className="app-sidebar__brand-text">{brand.text}</span>
      </div>
      <Button
        aria-label={closeLabel}
        className="icon-button app-sidebar__mobile-close"
        onClick={onClose}
        type="button"
      >
        {closeIcon}
      </Button>
    </div>
    <nav className="app-sidebar__nav" aria-label={navAriaLabel}>
      {navItems.map((item) => (
        <Button
          aria-current={item.active ? 'page' : undefined}
          aria-label={item.ariaLabel ?? item.label}
          className={`app-sidebar__nav-item ${item.active ? 'app-sidebar__nav-item--active' : ''} ${item.variant === 'danger' ? 'app-sidebar__nav-item--danger' : ''}`}
          key={item.id}
          onClick={item.onClick}
          title={item.title ?? item.label}
          type="button"
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      ))}
    </nav>
    <div className="app-sidebar__footer">
      {footerLabel && (
        <p className="app-sidebar__footer-label">{footerLabel}</p>
      )}
      {footer}
    </div>
  </aside>
);

export default Sidebar;
export type { SidebarNavItem };
