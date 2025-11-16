import React, { useCallback, useEffect, useRef } from 'react';

import PlannerGoalModal from '@/components/modals/planner/GoalModal';
import PlannerHabitModal from '@/components/modals/planner/HabitModal';
import PlannerFocusModal from '@/components/modals/planner/FocusModal';
import AddTaskSheet, { AddTaskSheetHandle } from '@/components/modals/planner/AddTaskSheet';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';
import { useLocalization } from '@/localization/useLocalization';
import { usePlannerTasksStore } from '@/features/planner/useTasksStore';
import { buildPayloadFromTask, buildTaskInputFromPayload } from '@/features/planner/taskCreation';
import type { AddTaskPayload, PlannerGoalId } from '@/types/planner';

export default function PlannerModals() {
  const { plannerTaskModal, closePlannerTaskModal } = useModalStore(
    useShallow((state) => ({
      plannerTaskModal: state.plannerTaskModal,
      closePlannerTaskModal: state.closePlannerTaskModal,
    })),
  );
  const sheetRef = useRef<AddTaskSheetHandle>(null);
  const tasks = usePlannerTasksStore((state) => state.tasks);
  const addTask = usePlannerTasksStore((state) => state.addTask);
  const updateTask = usePlannerTasksStore((state) => state.updateTask);
  const { strings } = useLocalization();
  const taskStrings = strings.plannerScreens.tasks;

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      if (plannerTaskModal.isOpen) {
        closePlannerTaskModal();
      }
      return;
    }

    if (!plannerTaskModal.isOpen) {
      sheetRef.current?.close();
      return;
    }

    if (plannerTaskModal.mode === 'edit' && plannerTaskModal.taskId) {
      const existing = tasks.find((task) => task.id === plannerTaskModal.taskId);
      if (existing) {
        const payload = buildPayloadFromTask(existing, taskStrings);
        sheetRef.current?.edit(payload, { taskId: existing.id });
        return;
      }
    }

    if (plannerTaskModal.initialPayload) {
      sheetRef.current?.edit(plannerTaskModal.initialPayload);
      return;
    }

    sheetRef.current?.open();
  }, [
    closePlannerTaskModal,
    plannerTaskModal.initialPayload,
    plannerTaskModal.isOpen,
    plannerTaskModal.mode,
    plannerTaskModal.taskId,
    taskStrings,
    tasks,
  ]);

  const handleSubmit = useCallback(
    (payload: AddTaskPayload, options?: { editingTaskId?: string; goalId?: PlannerGoalId | null }) => {
      const input = buildTaskInputFromPayload(payload, taskStrings);
      if (options?.goalId) {
        input.goalId = options.goalId;
      }
      if (options?.editingTaskId) {
        updateTask(options.editingTaskId, input);
      } else {
        addTask(input);
      }
    },
    [addTask, taskStrings, updateTask],
  );

  return (
    <>
      <AddTaskSheet
        ref={sheetRef}
        onCreate={(payload, options) => {
          handleSubmit(payload, { editingTaskId: options?.editingTaskId, goalId: plannerTaskModal.goalId as PlannerGoalId | null });
          if (!options?.keepOpen) {
            closePlannerTaskModal();
          }
        }}
        onDismiss={closePlannerTaskModal}
      />
      <PlannerGoalModal />
      <PlannerHabitModal />
      <PlannerFocusModal />
    </>
  );
}
