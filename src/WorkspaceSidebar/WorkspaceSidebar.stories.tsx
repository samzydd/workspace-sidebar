import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const meta = {
  title: 'Workspace Sidebar',
  component: WorkspaceSidebar,
  // Storybook's own preview CSS forces `height: 100%` onto whatever renders
  // directly under #storybook-root (needed for stories that *do* want to
  // fill the canvas), which would stretch our now content-sized, no-forced-
  // height shell right back to full viewport height. This decorator absorbs
  // that rule on a plain wrapper div instead, then centers the shell inside
  // it with its own inline flex (align-items: 'center', not the flex
  // default 'stretch') so the shell renders at its true, compact height.
  decorators: [(Story) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Story />
    </div>
  )],
  parameters: {
    // Centered (not the default fullscreen) — this is a compact,
    // content-sized card now, not a full-bleed page, so it reads best
    // floating in the middle of the canvas. Good for a clean screenshot.
    layout: 'centered',
    docs: { description: { component: `Rail-first exploration of @sakaniui/react. The rail alone is the resting
state — nothing is active, no drawer. Click a rail item to make it Active
and slide the workspace-navigation drawer open next to it; click it again
to slide it shut. The drawer itself has no active state of its own — every
group header starts closed and neutral. Click a group header to reveal its
rows with an Accordion-style cascade (each row fades/rises in with a short
stagger). Every collapsed rail item has a tooltip.` } },
  },
} satisfies Meta<typeof WorkspaceSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resting state: collapsed rail, no active item, drawer closed. */
export const Default: Story = {};

/** Drawer open (Projects active); every group still starts closed. */
export const DrawerOpen: Story = { args: { defaultActiveRail: 'Projects' } };

/** Everything open at once — every group revealed, for a full screenshot. */
export const AllGroupsExpanded: Story = {
  args: {
    defaultActiveRail: 'Projects',
    defaultOpen: ['projects', 'tasks', 'views', 'teams', 'reports', 'northstar', 'website', 'copilot'],
  },
};
