import React from 'react';

import PlannerTaskModal from '@/components/modals/planner/TaskModal';
import PlannerGoalModal from '@/components/modals/planner/GoalModal';
import PlannerHabitModal from '@/components/modals/planner/HabitModal';
import PlannerFocusModal from '@/components/modals/planner/FocusModal';

export default function PlannerModals() {
  return (
    <>
      <PlannerTaskModal />
      <PlannerGoalModal />
      <PlannerHabitModal />
      <PlannerFocusModal />
    </>
  );
}
