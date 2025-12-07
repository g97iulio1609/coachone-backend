import type { WorkoutProgram, WorkoutStatus } from '@onecoach/types';

type WorkoutProgramLike = Omit<
  Partial<WorkoutProgram>,
  'difficulty' | 'name' | 'description' | 'durationWeeks' | 'weeks' | 'goals'
> & {
  name: string;
  description: string;
  difficulty: string;
  durationWeeks: number;
  weeks: any[]; // Allow any structure for weeks to avoid schema mismatch
  goals: string[];
};

/**
 * Normalizza un programma workout di input aggiungendo i metadati obbligatori
 * richiesti dai servizi @onecoach/lib-workout (status/id/timestamps).
 */
export function normalizeWorkoutProgram(program: WorkoutProgramLike): WorkoutProgram {
  const nowIso = new Date().toISOString();
  const casted = program as Partial<WorkoutProgram>;
  const difficulty =
    program.difficulty && typeof program.difficulty === 'string'
      ? ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(program.difficulty)
        ? (program.difficulty as WorkoutProgram['difficulty'])
        : ('ADVANCED' as WorkoutProgram['difficulty'])
      : ('ADVANCED' as WorkoutProgram['difficulty']);

  return {
    id: casted.id ?? 'temp-program',
    createdAt: casted.createdAt ?? nowIso,
    updatedAt: casted.updatedAt ?? nowIso,
    status: casted.status ?? ('ACTIVE' as WorkoutStatus),
    userId: casted.userId,
    version: casted.version,
    metadata: casted.metadata ?? null,
    name: program.name,
    description: program.description,
    difficulty,
    durationWeeks: program.durationWeeks,
    weeks: program.weeks,
    goals: program.goals,
  };
}
