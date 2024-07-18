package database

import (
	"database/sql"
	"fmt"
	"log"
	"math"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"github.com/rossheat/gym/server/model"
)

var PostgresDB *sql.DB

func FormatPostgresConnectionParams(params *model.PostgresConnectionParams) string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		params.Host, params.Port, params.Username, params.Password, params.Database, params.SSLMode)
}

func ConnectToPostgres(params *model.PostgresConnectionParams) error {
	formattedParams := FormatPostgresConnectionParams(params)
	log.Printf("Attempting to connect to Postgres database with formatted params: %v\n", formattedParams)

	var err error
	PostgresDB, err = sql.Open("postgres", formattedParams)
	if err != nil {
		return err
	}
	err = PostgresDB.Ping()
	if err != nil {
		return err
	}
	log.Println("Connection to Postgres database has been established.")
	return nil
}

func MigratePostgres(cfg *model.Config) error {
	driver, err := postgres.WithInstance(PostgresDB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("error creating Postgres driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://database/migrations",
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("error creating migrate instance: %w", err)
	}

	if cfg.PostgresMigrationSteps == math.MinInt64 {
		log.Println("-pms flag not set; applying all available forward migrations...")
		err = m.Up()
	} else {
		steps := int(cfg.PostgresMigrationSteps)
		if steps > 0 {
			log.Printf("Applying %d forward migration step(s)...", steps)
		} else if steps < 0 {
			log.Printf("Reverting %d migration step(s)...", -steps)
		} else {
			log.Println("Migration step value is 0; no changes will be made.")
		}
		err = m.Steps(steps)
	}

	if err != nil {
		if err == migrate.ErrNoChange {
			log.Println("No migration changes were applied.")
			return nil
		}
		return fmt.Errorf("error during migration: %w", err)
	}

	if cfg.PostgresMigrationSteps == math.MinInt64 {
		log.Println("Successfully applied all available forward migrations.")
	} else if cfg.PostgresMigrationSteps > 0 {
		log.Printf("Successfully applied %d forward migration step(s).", cfg.PostgresMigrationSteps)
	} else if cfg.PostgresMigrationSteps < 0 {
		log.Printf("Successfully reverted %d migration step(s).", -cfg.PostgresMigrationSteps)
	}

	return nil
}

func SetupDatabase(cfg *model.Config) error {
	err := ConnectToPostgres(&cfg.PostgresConnectionParams)
	if err != nil {
		return fmt.Errorf("failed to connect to Postgres: %v", err)
	}

	err = MigratePostgres(cfg)
	if err != nil {
		return err
	}
	return nil
}
