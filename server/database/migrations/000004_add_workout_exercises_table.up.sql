-- 000004_add_workout_exercises_table.up.sql

CREATE TABLE workout_exercises (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    workout_id VARCHAR(255) NOT NULL,
    exercise_id VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE (workout_id, exercise_id)
);