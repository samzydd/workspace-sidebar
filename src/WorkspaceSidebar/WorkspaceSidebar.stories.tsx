import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const meta = {
  title: 'Workspace Sidebar',
  component: WorkspaceSidebar,
  parameters: {
    docs: { description: { component: 'Figma "AI workspace sidebar" (node 2307:42338). Click any group header to collapse or expand it.' } },
  },
} satisfies Meta<typeof WorkspaceSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As drawn in Figma: every group open except "Website refresh". */
export const Default: Story = {};

export const AllCollapsed: Story = { args: { defaultOpen: [] } };

export const AllExpanded: Story = {
  args: { defaultOpen: ['projects', 'tasks', 'views', 'teams', 'reports', 'northstar', 'website', 'copilot'] },
};
