/**
 * OneAgenda Services for MCP Tools
 *
 * Export centralizzato dei servizi server-side OneAgenda
 */

export { projectService } from './project.service';
export type { CreateProjectInput, UpdateProjectInput, ProjectWithDetails } from './project.service';

export { taskService } from './task.service';
export type { CreateTaskInput, UpdateTaskInput, TaskWithDetails } from './task.service';

export { milestoneService } from './milestone.service';
export type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
  MilestoneWithDetails,
} from './milestone.service';

export { habitService } from './habit.service';
export type { CreateHabitInput, UpdateHabitInput, HabitWithDetails } from './habit.service';

export {
  OneAgendaImportService,
  createOneAgendaAIContext,
  type OneAgendaImportResult,
} from './import.service';
export * from './imported-oneagenda.schema';
