// Tipi condivisi per il calendario utilizzati lato client
// Re-esportiamo i tipi definiti nel servizio per evitare duplicazioni
export type {
  CalendarAssignment,
  RecurrenceRule,
  CreateCalendarAssignmentRequest,
  UpdateCalendarAssignmentRequest,
  QueryCalendarAssignmentsRequest,
  DayPlanView,
} from '../calendar.service';
