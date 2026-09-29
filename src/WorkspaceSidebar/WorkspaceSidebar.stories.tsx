import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const meta = {
  title: 'Workspace Sidebar',
  component: WorkspaceSidebar,
  // Viewport-tall, horizontally centered stage with a 24px margin: the card
  // fills it top to bottom, so the whole sidebar fits on screen for a
  // recording without page scrolling. Inline height beats Storybook's own
  // `#storybook-root > * { height: 100% }` rule.
  decorators: [(Story) => (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', padding: 24, boxSizing: 'border-box' }}>
      <Story />
    </div>
  )],
  parameters: {
    // Fullscreen (no Storybook padding) — the decorator above does the
    // centering and margin itself; 'centered' would add its own padding on
    // top of the 100vh stage and make the page scroll.
    layout: 'fullscreen',
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
