import { useCallback, useMemo, useState } from "react";
import { create } from "zustand";

import { useDashboardStore } from "@/stores/dashboardStore";
import { exportDevScoreToXLSX } from "@/lib/utils";
import { isTester } from "@/lib/teams";

type MemberWorkflowState = {
  pointModeBySlug: Record<string, boolean>;
  committedPointsBySlug: Record<string, Record<string, number | undefined>>;
  setPointMode: (slug: string, enabled: boolean) => void;
  setCommittedPoint: (
    slug: string,
    issueUuid: string,
    value: number | undefined,
  ) => void;
};

const EMPTY_COMMITTED_POINTS: Record<string, number | undefined> = {};

const useMemberWorkflowStore = create<MemberWorkflowState>((set) => ({
  pointModeBySlug: {},
  committedPointsBySlug: {},
  setPointMode: (slug, enabled) =>
    set((state) => ({
      pointModeBySlug: {
        ...state.pointModeBySlug,
        [slug]: enabled,
      },
    })),
  setCommittedPoint: (slug, issueUuid, value) =>
    set((state) => ({
      committedPointsBySlug: {
        ...state.committedPointsBySlug,
        [slug]: {
          ...(state.committedPointsBySlug[slug] ?? {}),
          [issueUuid]: value,
        },
      },
    })),
}));

/**
 * Fetches a member by slug from the store and derives all overview metrics
 * and the CSV export handler. Subscribes only to the relevant store slice.
 */
export function useMemberData(slug: string) {
  const memberData = useDashboardStore(
    useCallback((s) => s.getMemberBySlug(slug), [slug]),
  );
  const pointMode = useMemberWorkflowStore(
    useCallback((state) => state.pointModeBySlug[slug] ?? false, [slug]),
  );
  const committedPoints = useMemberWorkflowStore(
    useCallback(
      (state) => state.committedPointsBySlug[slug] ?? EMPTY_COMMITTED_POINTS,
      [slug],
    ),
  );
  const setPointMode = useMemberWorkflowStore((state) => state.setPointMode);
  const setCommittedPoint = useMemberWorkflowStore(
    (state) => state.setCommittedPoint,
  );

  const isTesterMember = useMemo(() => {
    return isTester(memberData?.name || "");
  }, [memberData]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!memberData || isExporting) return;
    setIsExporting(true);
    try {
      await exportDevScoreToXLSX(
        memberData.issues,
        memberData.name,
        committedPoints,
      );
    } finally {
      setIsExporting(false);
    }
  }, [committedPoints, isExporting, memberData]);

  return {
    memberData,
    isTesterMember,
    handleExport,
    isExporting,
    pointMode,
    setPointMode,
    committedPoints,
    setCommittedPoint,
  };
}
