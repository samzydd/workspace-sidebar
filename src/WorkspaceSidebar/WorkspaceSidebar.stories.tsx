import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const meta = {
  title: 'Workspace Sidebar',
  component: WorkspaceSidebar,
  parameters: {
    docs: { description: { component: `Rail-first exploration of @sakaniui/react. The rail alone is the resting
state — nothing is active, no drawer. Click a rail item to make it Active
and slide the workspace-navigation drawer open next to it; click it again
to slide it shut. The drawer itself has no active state of its own —
every group header and row starts neutral — and its group headers
(Projects, Tasks, Views, Teams, Reports, Northstar Mobile, Website
refresh, AI Copilot) each collapse/expand independently.` } },
  },
} satisfies Meta<typeof WorkspaceSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resting state: collapsed rail, no active item, drawer closed. */
export const Default: Story = {};

/** Same resting rail, with a rail item pre-activated and the drawer already open. */
export const DrawerOpen: Story = { args: { defaultActiveRail: 'Projects' } };

export const AllGroupsCollapsed: Story = { args: { defaultActiveRail: 'Projects', defaultOpen: [] } };

export const AllGroupsExpanded: Story = {
  args: {
    defaultActiveRail: 'Projects',
    defaultOpen: ['projects', 'tasks', 'views', 'teams', 'reports', 'northstar', 'website', 'copilot'],
  },
};
