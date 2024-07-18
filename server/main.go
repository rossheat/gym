package main

import (
	"flag"
	"runtime"

	"math"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/awspkg"
	"github.com/rossheat/gym/server/config"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/handler"
	"github.com/rossheat/gym/server/loggerpkg"
	logger "github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/middleware"
	"github.com/rossheat/gym/server/model"

	_ "github.com/golang-migrate/migrate/v4/source/file"

	"log"
)

func SetupRouter(cfg *model.Config) (*gin.Engine, error) {
	err := database.SetupDatabase(cfg)
	if err != nil {
		return nil, err
	}

	if cfg.Env == model.EnvProduction {
		gin.SetMode(gin.ReleaseMode)
		log.Println("Set Gin mode to release")
	} else {
		gin.SetMode(gin.DebugMode)
		log.Println("Set Gin mode to debug")
	}

	awsSession, err := awspkg.NewAWSSession(cfg)
	if err != nil {
		log.Fatalf("Error creating AWS session: %v", err)
	}

	router := gin.Default()

	lgr := loggerpkg.NewLogger(awsSession, cfg)
	router.Use(middleware.Set("logger", lgr))
	router.Use(logger.LoggingMiddleware(lgr))

	router.Use(middleware.Set("config", cfg))

	router.Use(config.NewCorsConfig(cfg))

	router.GET("/ping", handler.Ping)

	router.Use(middleware.ClerkAuthMiddleware())

	exercises := router.Group("/exercises")
	{
		exercises.POST("", handler.CreateExercise)
		exercises.GET("", handler.GetAllExercises)
		exercises.GET("/:id", handler.GetExercise)
		exercises.PUT("/:id", handler.UpdateExercise)
		exercises.DELETE("/:id", handler.DeleteExercise)
		exercises.GET("/:id/statistics", handler.GetExerciseStatistics)
	}

	router.GET("/muscle-groups", handler.GetAllMuscleGroups)
	router.GET("/equipment", handler.GetAllEquipment)

	workouts := router.Group("/workouts")
	{
		workouts.GET("", handler.GetAllWorkouts)
		workouts.POST("", handler.CreateWorkout)
		workouts.GET("/:id", handler.GetWorkout)
		workouts.PUT("/:id", handler.UpdateWorkout)
		workouts.DELETE("/:id", handler.DeleteWorkout)
	}

	return router, nil
}

func main() {
	/* Usage:

	   go run . -env <environment> [-pms <steps>]

	   Environments:
	     development    Development environment
	     staging        Staging environment
	     production     Production environment

	   Options:
	     -env string    Required. Set the program's environment.
	     -pms int64     Optional. Number of Postgres migration steps to perform.
	                    Positive: apply forward migrations
	                    Negative: undo migrations
	                    Omit: apply all up migrations

	   Examples:
	     go run . -env development
	     go run . -env staging -pms 5
	     go run . -env production -pms -3

	   Note:
	     The minimum value for -pms is math.MinInt64, which signifies "not set".
	*/

	env := flag.String("env", "", "Set the program's environment")
	PostgresMigrationSteps := flag.Int64("pms", math.MinInt64, "Number of Postgres migration steps")
	flag.Parse()

	log.Println("Executing program with Go version: ", runtime.Version())

	cfg, err := config.LoadConfig(*env)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	cfg.PostgresMigrationSteps = *PostgresMigrationSteps

	log.Printf("Initialised config: %#v\n", cfg)

	router, err := SetupRouter(cfg)
	if err != nil {
		log.Fatalf("setupRouter returned err: %v", err)
	}

	err = router.Run(cfg.ServerAddress)
	log.Fatalf("router.Run returned err: %v", err)
}
