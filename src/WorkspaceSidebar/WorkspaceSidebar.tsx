/**
 * WorkspaceSidebar — a rail + slide-out drawer exploration of @sakaniui/react,
 * built from the Figma "AI workspace sidebar" (Sakani Design System file,
 * node 2307:42338).
 *
 * Interaction (not the literal Figma layout, which shows both panes open at
 * once): the rail is the default view — nothing active, no drawer. Clicking
 * a rail item makes *that* item Active and slides the workspace-navigation
 * drawer open next to it; clicking the active item again slides it shut.
 * The drawer itself carries no active state of its own — every group header
 * and row starts neutral, so it's a blank surface to click around in.
 *
 *   Collapsed utility rail (56, always visible)   Drawer (336, slides in/out)
 *   ├─ Product mark (sparkles)                    ├─ SidebarHeader type="workspace"
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
 * shows or hides its rows. The rows are not a library component in Figma
 * (plain "Navigation item" frames: 27px, 12px label, 16px left inset, optional
 * 6px status dot and a Badge count), so they live here as NavRow.
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
  SidebarGroupLabel, SidebarHeader, SidebarItem, SidebarPromo, SidebarSearch,
} from '@sakaniui/react';
import { WorkspaceLogo } from './WorkspaceLogo';
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

interface Row { label: string; count?: string; dot?: boolean }
interface Group { id: string; icon: LucideIcon; label: string; open: boolean; rows: Row[] }

const WORKSPACE_GROUPS: Group[] = [
  { id: 'projects', icon: FolderKanban, label: 'Projects', open: true, rows: [
    { label: 'Active projects', count: '6' }, { label: 'Templates' }, { label: 'Archive' },
  ] },
  { id: 'tasks', icon: SquareCheckBig, label: 'Tasks', open: true, rows: [
    { label: 'My tasks', count: '8', dot: true },
    { label: 'Assigned to me', count: '14', dot: true },
    { label: 'Priorities', count: '3', dot: true },
    { label: 'Completed', dot: true },
  ] },
  { id: 'views', icon: LayoutDashboard, label: 'Views', open: true, rows: [
    { label: 'Board' }, { label: 'List' }, { label: 'Calendar' },
  ] },
  { id: 'teams', icon: Users, label: 'Teams', open: true, rows: [
    { label: 'Design', count: '8' }, { label: 'Engineering', count: '12' }, { label: 'Marketing', count: '6' },
  ] },
  { id: 'reports', icon: ChartNoAxesCombined, label: 'Reports', open: true, rows: [
    { label: 'Overview' }, { label: 'Productivity' }, { label: 'Usage' },
  ] },
];

const PROJECT_GROUPS: Group[] = [
  { id: 'northstar', icon: FolderOpenDot, label: 'Northstar Mobile', open: true, rows: [
    { label: 'Launch brief', count: '4' }, { label: 'Research notes', count: '9' }, { label: 'Decision log' },
  ] },
  // Closed in Figma, so its rows aren't drawn there — these are placeholders.
  { id: 'website', icon: Folder, label: 'Website refresh', open: false, rows: [
    { label: 'Homepage' }, { label: 'Brand guidelines' },
  ] },
  { id: 'copilot', icon: Sparkles, label: 'AI Copilot', open: true, rows: [
    { label: 'Prompt library', count: '16' }, { label: 'Beta feedback', count: '7' },
  ] },
];

/* ── Pieces ──────────────────────────────────────────────────────────────── */

// No active row in the drawer by design — see the file header.
const NavRow: React.FC<Row> = ({ label, count, dot }) => (
  <button type="button" data-hover-item="" className={styles.row}>
    {dot && <span className={styles.row__dot} aria-hidden="true" />}
    <span className={styles.row__label}>{label}</span>
    {count && <Badge variant="neutral" emphasis="subtle">{count}</Badge>}
  </button>
);

const NavGroup: React.FC<{ group: Group; open: boolean; onToggle: () => void }> = ({ group, open, onToggle }) => (
  <>
    <SidebarItem icon={group.icon} label={group.label} hasSubmenu expanded={open} onClick={onToggle} />
    {open && group.rows.map((row) => <NavRow key={row.label} {...row} />)}
  </>
);

/* ── Sidebar ─────────────────────────────────────────────────────────────── */

export interface WorkspaceSidebarProps {
  /** Group ids open on first render. Defaults to the Figma state (all open except "Website refresh"). */
  defaultOpen?: string[];
  /** Rail item active — and the drawer open — on first render. Defaults to
   * none: the collapsed rail alone is the resting state. */
  defaultActiveRail?: string;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ defaultOpen, defaultActiveRail }) => {
  const [open, setOpen] = React.useState<Set<string>>(
    () => new Set(defaultOpen ?? [...WORKSPACE_GROUPS, ...PROJECT_GROUPS].filter((g) => g.open).map((g) => g.id)),
  );
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const [promo, setPromo] = React.useState(true);

  // The rail item that's Active also drives whether the drawer is open —
  // clicking the already-active item closes it, clicking another switches.
  const [activeRail, setActiveRail] = React.useState<string | undefined>(defaultActiveRail);
  const drawerOpen = activeRail !== undefined;
  const handleRailClick = (label: string) => setActiveRail((prev) => (prev === label ? undefined : label));

  const renderGroups = (groups: Group[]) =>
    groups.map((g) => <NavGroup key={g.id} group={g} open={open.has(g.id)} onToggle={() => toggle(g.id)} />);

  return (
    <div className={styles.shell}>
      <aside className={styles.rail} aria-label="Workspace shortcuts">
        <div className={styles.railGroup}>
          <span className={styles.mark} aria-hidden="true"><Sparkles size={18} /></span>
          <Divider className={styles.railDivider} />
          {RAIL.map(({ icon, label }) => (
            <SidebarItem
              key={label}
              icon={icon}
              label={label}
              collapsed
              active={activeRail === label}
              activeIndicator={false}
              aria-pressed={activeRail === label}
              onClick={() => handleRailClick(label)}
            />
          ))}
        </div>
        <div className={styles.railGroup}>
          {RAIL_UTILITIES.map(({ icon, label }) => (
            <IconButton key={label} icon={icon} aria-label={label} variant="ghost" size="sm" />
          ))}
          <Divider className={styles.railDivider} />
          <Avatar size="md" initials="AB" />
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

          <SidebarFooter type="user-menu" title="Maya Chen" subtitle="maya@northstar.ai" avatarInitials="AB" />
        </div>
      </nav>
    </div>
  );
};

export default WorkspaceSidebar;
