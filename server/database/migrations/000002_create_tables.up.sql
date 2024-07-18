-- 000002_create_tables.up.sql

CREATE TABLE workouts (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sets (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    workout_id VARCHAR(255) NOT NULL,
    exercise_id VARCHAR(255) NOT NULL,
    weight FLOAT NOT NULL,
    reps INTEGER NOT NULL,
    rest_before INTEGER,
    "order" INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

CREATE TABLE exercises (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    media_url VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_equipment (
    exercise_id VARCHAR(255) NOT NULL,
    equipment_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (exercise_id, equipment_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE muscle_groups (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_muscle_groups (
    exercise_id VARCHAR(255) NOT NULL,
    muscle_group_id VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL,
    PRIMARY KEY (exercise_id, muscle_group_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
);