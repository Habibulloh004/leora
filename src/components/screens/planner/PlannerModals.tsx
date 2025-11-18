import React, { useCallback, useEffect, useRef } from 'react';

import PlannerGoalModal from '@/components/modals/planner/GoalModal';
import PlannerHabitModal from '@/components/modals/planner/HabitModal';
import PlannerFocusModal from '@/components/modals/planner/FocusModal';
import AddTaskSheet, { AddTaskSheetHandle } from '@/components/modals/planner/AddTaskSheet';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';
import { useLocalization } from '@/localization/useLocalization';
import { usePlannerDomainStore } from '@/stores/usePlannerDomainStore';
import { buildPayloadFromTask, buildDomainTaskInputFromPayload } from '@/features/planner/taskAdapters';
import type { AddTaskPayload } from '@/types/planner';

export default function PlannerModals() {
  const { plannerTaskModal, closePlannerTaskModal } = useModalStore(
    useShallow((state) => ({
      plannerTaskModal: state.plannerTaskModal,
      closePlannerTaskModal: state.closePlannerTaskModal,
    })),
  );
  const sheetRef = useRef<AddTaskSheetHandle>(null);
  const { tasks, createTask, updateTask } = usePlannerDomainStore(
    useShallow((state) => ({
      tasks: state.tasks,
      createTask: state.createTask,
      updateTask: state.updateTask,
    })),
  );
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

    if (plannerTaskModal.goalId) {
      sheetRef.current?.edit({ goalId: plannerTaskModal.goalId });
      return;
    }

    sheetRef.current?.open();
  }, [
    closePlannerTaskModal,
    plannerTaskModal.isOpen,
    plannerTaskModal.mode,
    plannerTaskModal.taskId,
    plannerTaskModal.goalId,
    taskStrings,
    tasks,
  ]);

  const handleSubmit = useCallback(
    (payload: AddTaskPayload, options?: { editingTaskId?: string }) => {
      const input = buildDomainTaskInputFromPayload(payload, taskStrings);
      if (options?.editingTaskId) {
        updateTask(options.editingTaskId, {
          ...input,
          updatedAt: new Date().toISOString(),
        });
      } else {
        createTask({
          ...input,
          id: undefined,
          userId: 'local-user',
          status: 'planned',
          priority: input.priority ?? 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [createTask, taskStrings, updateTask],
  );

  return (
    <>
      <AddTaskSheet
        ref={sheetRef}
        onCreate={(payload, options) => {
          handleSubmit(payload, { editingTaskId: options?.editingTaskId });
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
