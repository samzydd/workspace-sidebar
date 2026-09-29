/**
 * WorkspaceSidebar — a rail + slide-out drawer exploration of @sakaniui/react,
 * built from the Figma "AI workspace sidebar" (Sakani Design System file,
 * node 2307:42338).
 *
 * Interaction (not the literal Figma layout, which shows both panes open at
 * once): the rail is the default view — nothing active, no drawer. Clicking
 * a rail item makes *that* item Active and slides the workspace-navigation
 * drawer open next to it; clicking the active item again slides it shut.
 * Everything in the drawer starts neutral; clicking a sub-item row makes it
 * the one Active row (group headers only open and close).
 *
 *   Collapsed utility rail (56, always visible)   Drawer (240, slides in/out)
 *   ├─ Sakani logo (brand mark)                   ├─ SidebarHeader type="workspace"
 *   ├─ Divider                                    ├─ SidebarSearch type="command"
 *   ├─ SidebarItem collapsed ×8 (click → active)   ├─ primary nav — SidebarItem ×4
 *   └─ IconButton ghost ×3, Divider, Avatar        ├─ SidebarDivider
 *                                                  ├─ "Workspace" — 5 collapsible groups
 *                                                  ├─ SidebarDivider
 *                                                  ├─ "Projects" — 3 collapsible groups
 *                                                  ├─ SidebarDivider
 *                                                  ├─ Settings, Help & docs
 *                                                  ├─ SidebarPromo type="upgrade"
 *                                                  └─ SidebarFooter type="user-menu"
 *
 * Group headers are SidebarItem with `hasSubmenu` + `expanded`; clicking one
 * reveals or hides its rows with an Accordion-style grid-rows animation
 * (0fr -> 1fr, plus a short fade/rise on the rows themselves) — every group
 * starts closed. The rows are not a library component in Figma (plain
 * "Navigation item" frames: 27px, 12px label, 16px left inset, optional 6px
 * status dot and a Badge count), so they live here as NavRow.
 *
 * Every collapsed rail item is wrapped in the system Tooltip (pointer
 * "center-right", since the rail sits flush on the left edge) with
 * `nativeTooltip={false}` on the SidebarItems so the browser's native title
 * tooltip doesn't also fire.
 */

import React from 'react';
import {
  Sparkles, LayoutGrid, Folder, ListTodo, FolderKanban, MessagesSquare, Bot,
  Users, PlugZap, Settings2, LifeBuoy, SlidersHorizontal, House, Bell, Inbox,
  ListChecks, SquareCheckBig, LayoutDashboard, ChartNoAxesCombined, FolderOpenDot,
  type LucideIcon,
} from 'lucide-react';
import {
  Avatar, Badge, Divider, HoverGroup, IconButton, SidebarDivider, SidebarFooter,
  SidebarGroupLabel, SidebarHeader, SidebarItem, SidebarPromo, SidebarSearch, Tooltip,
} from '@sakaniui/react';
import { WorkspaceLogo } from './WorkspaceLogo';
// Figma Avatar "Type=Image" default photo (node 86:339), exported at 2x.
import avatarDefault from './avatar-default.jpg';
import styles from './WorkspaceSidebar.module.css';

/* ── Data (labels, icons and counts exactly as in Figma) ─────────────────── */

const RAIL: Array<{ icon: LucideIcon; label: string }> = [
  { icon: LayoutGrid, label: 'Dashboard' },
  { icon: Folder, label: 'Projects' },
  { icon: ListTodo, label: 'Tasks' },
  { icon: FolderKanban, label: 'Boards' },
  { icon: MessagesSquare, label: 'Messages' },
  { icon: Bot, label: 'Agents' },
  { icon: Users, label: 'Teams' },
  { icon: PlugZap, label: 'Integrations' },
];

const RAIL_UTILITIES: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Settings2, label: 'Settings' },
  { icon: LifeBuoy, label: 'Help & docs' },
  { icon: SlidersHorizontal, label: 'Preferences' },
];

const PRIMARY_NAV: Array<{ icon: LucideIcon; label: string; badge?: string }> = [
  { icon: House, label: 'Home' },
  { icon: Bell, label: 'Updates', badge: '12' },
  { icon: Inbox, label: 'Inbox', badge: '20' },
  { icon: ListChecks, label: 'My tasks', badge: '8' },
];

/** Status dot color — one of the design system's solid status tokens. */
type DotTone = 'info' | 'warning' | 'danger' | 'success';
interface Row { label: string; count?: string; dot?: DotTone }
interface Group { id: string; icon: LucideIcon; label: string; rows: Row[] }

const WORKSPACE_GROUPS: Group[] = [
  { id: 'projects', icon: FolderKanban, label: 'Projects', rows: [
    { label: 'Active projects', count: '6' }, { label: 'Templates' }, { label: 'Archive' },
  ] },
  { id: 'tasks', icon: SquareCheckBig, label: 'Tasks', rows: [
    { label: 'My tasks', count: '8', dot: 'info' },
    { label: 'Assigned to me', count: '14', dot: 'warning' },
    { label: 'Priorities', count: '3', dot: 'danger' },
    { label: 'Completed', dot: 'success' },
  ] },
  { id: 'views', icon: LayoutDashboard, label: 'Views', rows: [
    { label: 'Board' }, { label: 'List' }, { label: 'Calendar' },
  ] },
  { id: 'teams', icon: Users, label: 'Teams', rows: [
    { label: 'Design', count: '8' }, { label: 'Engineering', count: '12' }, { label: 'Marketing', count: '6' },
  ] },
  { id: 'reports', icon: ChartNoAxesCombined, label: 'Reports', rows: [
    { label: 'Overview' }, { label: 'Productivity' }, { label: 'Usage' },
  ] },
];

const PROJECT_GROUPS: Group[] = [
  { id: 'northstar', icon: FolderOpenDot, label: 'Northstar Mobile', rows: [
    { label: 'Launch brief', count: '4' }, { label: 'Research notes', count: '9' }, { label: 'Decision log' },
  ] },
  { id: 'website', icon: Folder, label: 'Website refresh', rows: [
    { label: 'Homepage' }, { label: 'Brand guidelines' },
  ] },
  { id: 'copilot', icon: Sparkles, label: 'AI Copilot', rows: [
    { label: 'Prompt library', count: '16' }, { label: 'Beta feedback', count: '7' },
  ] },
];

/* ── Pieces ──────────────────────────────────────────────────────────────── */

// Rows start neutral; the one you click becomes Active (Figma's "Assigned to
// me" treatment: bg/subtle + fg/default label).
const NavRow: React.FC<Row & { active: boolean; onSelect: () => void }> = ({ label, count, dot, active, onSelect }) => (
  <button
    type="button"
    data-hover-item=""
    aria-current={active ? 'page' : undefined}
    className={[styles.row, active ? styles['row--active'] : ''].filter(Boolean).join(' ')}
    onClick={onSelect}
  >
    {dot && <span className={styles.row__dot} style={{ background: `var(--color-${dot}-solid)` }} aria-hidden="true" />}
    <span className={styles.row__label}>{label}</span>
    {count && <Badge variant="neutral" emphasis="subtle">{count}</Badge>}
  </button>
);

// Rows are always mounted (never conditionally rendered) so the grid-rows
// transition has something to animate between — same trick as Accordion.
// Header + rows are one flex item (.groupItem) so the parent's between-group
// gap doesn't also sneak in as a second gap above the (0-height-when-closed)
// rows wrapper — the header-to-rows gap instead lives inside rowsInner's own
// top padding, which the grid-rows collapse hides along with everything else
// while closed.
const NavGroup: React.FC<{
  group: Group; open: boolean; onToggle: () => void; activeRow?: string; onSelectRow: (id: string) => void;
}> = ({ group, open, onToggle, activeRow, onSelectRow }) => (
  <div className={styles.groupItem}>
    <SidebarItem icon={group.icon} label={group.label} hasSubmenu expanded={open} onClick={onToggle} />
    <div className={[styles.rowsWrap, open ? styles['rowsWrap--open'] : ''].filter(Boolean).join(' ')}>
      <div className={styles.rowsClip}>
        <div className={styles.rowsInner}>
          {group.rows.map((row) => {
            const id = `${group.id}/${row.label}`;
            return <NavRow key={row.label} {...row} active={activeRow === id} onSelect={() => onSelectRow(id)} />;
          })}
        </div>
      </div>
    </div>
  </div>
);

/** Rail tooltip (pointer="center-right": the rail sits flush left, so the
 * bubble opens to the right) that goes away once its item is clicked.
 * The library Tooltip also shows on :focus-within, and a clicked button
 * keeps focus — without this the bubble would stay up after every click.
 * A fresh hover (or focus leaving) brings it back. */
const RailTip: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => {
  const [muted, setMuted] = React.useState(false);
  return (
    <span
      className={[styles.railTip, muted ? styles['railTip--muted'] : ''].filter(Boolean).join(' ')}
      onClickCapture={() => setMuted(true)}
      onMouseEnter={() => setMuted(false)}
      onBlur={() => setMuted(false)}
    >
      <Tooltip title={title} subtitle={subtitle} pointer="center-right">{children}</Tooltip>
    </span>
  );
};

const RailItem: React.FC<{ icon: LucideIcon; label: string; active: boolean; onClick: () => void }> = ({
  icon, label, active, onClick,
}) => (
  <RailTip title={label}>
    <SidebarItem
      icon={icon}
      label={label}
      collapsed
      active={active}
      activeIndicator={false}
      nativeTooltip={false}
      onClick={onClick}
    />
  </RailTip>
);

/* ── Sidebar ─────────────────────────────────────────────────────────────── */

export interface WorkspaceSidebarProps {
  /** Group ids open on first render. Defaults to none — every group starts closed. */
  defaultOpen?: string[];
  /** Rail item active — and the drawer open — on first render. Defaults to
   * none: the collapsed rail alone is the resting state. */
  defaultActiveRail?: string;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ defaultOpen = [], defaultActiveRail }) => {
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(defaultOpen));
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const [promo, setPromo] = React.useState(true);
  // One active row across the whole drawer ("groupId/label"); none until clicked.
  const [activeRow, setActiveRow] = React.useState<string | undefined>();

  // The rail item that's Active also drives whether the drawer is open —
  // clicking the already-active item closes it, clicking another switches.
  const [activeRail, setActiveRail] = React.useState<string | undefined>(defaultActiveRail);
  const drawerOpen = activeRail !== undefined;
  const handleRailClick = (label: string) => setActiveRail((prev) => (prev === label ? undefined : label));

  const renderGroups = (groups: Group[]) =>
    groups.map((g) => (
      <NavGroup key={g.id} group={g} open={open.has(g.id)} onToggle={() => toggle(g.id)} activeRow={activeRow} onSelectRow={setActiveRow} />
    ));

  return (
    <div className={styles.shell}>
      <aside className={styles.rail} aria-label="Workspace shortcuts">
        <div className={styles.railGroup}>
          <RailTip title="Sakani">
            <span className={styles.mark} aria-hidden="true"><WorkspaceLogo tone="brand" size={32} /></span>
          </RailTip>
          <Divider className={styles.railDivider} />
          {RAIL.map(({ icon, label }) => (
            <RailItem key={label} icon={icon} label={label} active={activeRail === label} onClick={() => handleRailClick(label)} />
          ))}
        </div>
        <div className={styles.railGroup}>
          {RAIL_UTILITIES.map(({ icon, label }) => (
            <RailTip key={label} title={label}>
              <IconButton icon={icon} aria-label={label} variant="ghost" size="sm" />
            </RailTip>
          ))}
          <Divider className={styles.railDivider} />
          <RailTip title="Maya Chen" subtitle="maya@northstar.ai">
            <Avatar size="md" src={avatarDefault} alt="Maya Chen" />
          </RailTip>
        </div>
      </aside>

      <nav
        className={[styles.panelWrap, drawerOpen ? styles['panelWrap--open'] : ''].filter(Boolean).join(' ')}
        aria-label="Workspace navigation"
        aria-hidden={!drawerOpen}
      >
        <div className={styles.panel}>
          <HoverGroup className={styles.scroll}>
            <SidebarHeader type="workspace" title="Sakaniui Ai" subtitle="Product workspace · 24 members" logo={<WorkspaceLogo />} />
            <SidebarSearch type="command" placeholder="Search or ask AI…" />

            <div className={styles.list}>
              {PRIMARY_NAV.map((item) => <SidebarItem key={item.label} {...item} />)}
            </div>

            <SidebarDivider />
            <div className={styles.groups}>
              <div className={styles.label}><SidebarGroupLabel>Workspace</SidebarGroupLabel></div>
              {renderGroups(WORKSPACE_GROUPS)}
            </div>

            <SidebarDivider />
            <div className={styles.groups}>
              <div className={styles.label}><SidebarGroupLabel>Projects</SidebarGroupLabel></div>
              {renderGroups(PROJECT_GROUPS)}
            </div>

            <SidebarDivider />
            <div className={styles.list}>
              <SidebarItem icon={Settings2} label="Settings" />
              <SidebarItem icon={LifeBuoy} label="Help & docs" />
            </div>

            {promo && (
              <SidebarPromo
                type="upgrade"
                title="Upgrade to Pro"
                description="Unlock unlimited projects and advanced analytics."
                ctaLabel="Upgrade workspace"
                onDismiss={() => setPromo(false)}
              />
            )}
          </HoverGroup>

          <SidebarFooter type="user-menu" title="Maya Chen" subtitle="maya@northstar.ai" avatarSrc={avatarDefault} />
        </div>
      </nav>
    </div>
  );
};

export default WorkspaceSidebar;
