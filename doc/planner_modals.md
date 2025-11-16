# Planner Modals Roadmap

This document tracks the staged work for aligning AddTaskSheet, HabitModal, and GoalModal.

## Phase 1 – Task Modal Edit Support
- Normalize AddTaskSheet so it can load an existing task payload.
- Add update capabilities in the planner task store and trigger them from edit flows.
- Ensure bottom sheet paddings/time & date pickers match Goal/Habit logic.

## Phase 2 – Habit & Goal Editing
- Extend HabitModal and GoalModal with edit payloads and wire them into their tabs.
- Provide delete actions hooked to domain stores (once CRUD data layers exist).

## Phase 3 – Localization & UX Polish
- Move remaining hard-coded strings to localization bundles (en/ru/uz/ar/tr).
- Adjust modal sizing/padding/overlays for consistency.
- Document QA steps per platform.

This roadmap will be updated as each phase completes.

## Phase 4 – Data CRUD Alignment (future)
- Replace static habit/goal data providers with stores that collect user-generated items.
- Wire HabitModal/GoalModal create/update/delete actions into those stores and surface edits on `habits.tsx` / `goals.tsx` tabs.
- Add migration notes for existing seed data.

### Progress Update (Phase 1)
- Added task metadata snapshots so AddTaskSheet can hydrate existing tasks.
- Implemented edit flow wiring (TaskCard → modal store → AddTaskSheet) and update logic in the planner task store.
- Native date/time pickers now mirror Goal/Habit behavior, ensuring a consistent UX.
