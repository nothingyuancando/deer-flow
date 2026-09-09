import { afterEach, expect, rs, test } from "@rstest/core";
import { cleanup, render } from "@testing-library/react";

import { AgentCard } from "@/components/workspace/agents/agent-card";
import type { Agent } from "@/core/agents";

rs.mock("@/core/i18n/hooks", () => ({
  useI18n: () => ({
    t: {
      agents: {
        chat: "Chat",
        settings: "Settings",
        delete: "Delete",
        deleteConfirm: "Are you sure?",
        deleteSuccess: "Deleted",
      },
      common: {
        cancel: "Cancel",
        delete: "Delete",
        loading: "Loading…",
      },
    },
  }),
}));

rs.mock("@/core/agents", () => ({
  useDeleteAgent: () => ({ mutateAsync: rs.fn(), isPending: false }),
}));

rs.mock("next/navigation", () => ({
  useRouter: () => ({ push: rs.fn() }),
}));

rs.mock("sonner", () => ({
  toast: { success: rs.fn(), error: rs.fn() },
}));

rs.mock("@/components/workspace/agents/agent-settings-dialog", () => ({
  AgentSettingsDialog: () => <div data-testid="agent-settings-stub" />,
}));

function makeAgent(overrides: Partial<Agent>): Agent {
  return {
    name: "test-agent",
    description: "Test agent",
    model: null,
    tool_groups: null,
    skills: null,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

test("renders skill badges when tool_groups is an explicit empty array", () => {
  const { container } = render(
    <AgentCard
      agent={makeAgent({ tool_groups: [], skills: ["data-analysis"] })}
    />,
  );

  expect(container.textContent).toContain("data-analysis");
});

test("renders skill badges when tool_groups is null", () => {
  const { container } = render(
    <AgentCard
      agent={makeAgent({ tool_groups: null, skills: ["data-analysis"] })}
    />,
  );

  expect(container.textContent).toContain("data-analysis");
});

test("renders tool-group badges when skills is null", () => {
  const { container } = render(
    <AgentCard agent={makeAgent({ tool_groups: ["browser"], skills: null })} />,
  );

  expect(container.textContent).toContain("browser");
});

test("renders both tool-group and skill badges together", () => {
  const { container } = render(
    <AgentCard
      agent={makeAgent({ tool_groups: ["browser"], skills: ["data-analysis"] })}
    />,
  );

  expect(container.textContent).toContain("browser");
  expect(container.textContent).toContain("data-analysis");
});

test("renders no badge section when both lists are empty", () => {
  const { container } = render(
    <AgentCard agent={makeAgent({ tool_groups: [], skills: [] })} />,
  );

  expect(container.textContent).not.toContain("data-analysis");
  expect(container.textContent).not.toContain("browser");
});
