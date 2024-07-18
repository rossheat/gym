package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"slices"
	"strings"

	gincors "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rossheat/gym/server/model"
)

func LoadConfig(env string) (*model.Config, error) {

	validEnvs := []model.Env{model.EnvDevelopment, model.EnvStaging, model.EnvProduction}
	envIsValid := slices.Contains(validEnvs, model.Env(env))
	if !envIsValid {
		return nil, fmt.Errorf("the 'ENV' environment variable must be set to 'development' or 'staging' or 'production'")
	}

	envFile := ".env." + env

	err := godotenv.Load(envFile)
	if err != nil {
		// Search for the dot env file in parent directory
		envFile = filepath.Join("..", ".env."+env)
		err := godotenv.Load(envFile)
		if err != nil {
			return nil, fmt.Errorf("failed to load dot env file: %v", err)
		}
	}
	log.Printf("Loaded environment variables from %v", envFile)

	requiredEnvVars := []string{"POSTGRES_USERNAME", "POSTGRES_PASSWORD", "POSTGRES_HOST",
		"POSTGRES_PORT", "POSTGRES_DATABASE", "POSTGRES_SSL_MODE", "SERVER_ADDRESS",
		"ALLOWED_ORIGINS", "CLERK_BASE64_ENCODED_PEM_KEY", "AWS_REGION", "AWS_CLOUDWATCH_LOG_GROUP_NAME", "AWS_S3_BUCKET_NAME"}

	if _, err := CheckEnvVars(requiredEnvVars); err != nil {
		return nil, err
	}

	return &model.Config{
		ServerAddress:             os.Getenv("SERVER_ADDRESS"),
		AllowedOrigins:            strings.Split(os.Getenv("ALLOWED_ORIGINS"), ";"),
		ClerkBase64EncodedPEMKey:  os.Getenv("CLERK_BASE64_ENCODED_PEM_KEY"),
		AWSRegion:                 os.Getenv("AWS_REGION"),
		AWSCloudWatchLogGroupName: os.Getenv("AWS_CLOUDWATCH_LOG_GROUP_NAME"),
		AWSS3BucketName:           os.Getenv("AWS_S3_BUCKET_NAME"),
		Env:                       env,
		PostgresConnectionParams: model.PostgresConnectionParams{
			Username: os.Getenv("POSTGRES_USERNAME"),
			Password: os.Getenv("POSTGRES_PASSWORD"),
			Database: os.Getenv("POSTGRES_DATABASE"),
			Host:     os.Getenv("POSTGRES_HOST"),
			Port:     os.Getenv("POSTGRES_PORT"),
			SSLMode:  os.Getenv("POSTGRES_SSL_MODE"),
		},
	}, nil
}

func CheckEnvVars(requiredEnvVars []string) (missingEnvVars []string, err error) {

	missingEnvVars = make([]string, 0)

	for _, requiredEnvVar := range requiredEnvVars {
		if os.Getenv(requiredEnvVar) == "" {
			missingEnvVars = append(missingEnvVars, requiredEnvVar)
		}
	}

	if len(missingEnvVars) > 0 {
		return missingEnvVars, fmt.Errorf("the following environment variables are required but were not provided: %v; please check your dot env file if applicable", missingEnvVars)
	}

	return missingEnvVars, nil
}

func NewCorsConfig(cfg *model.Config) gin.HandlerFunc {
	corsConfig := gincors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.AllowedOrigins
	corsConfig.AllowHeaders = append(corsConfig.AllowHeaders, "Authorization")
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AllowCredentials = true
	return gincors.New(corsConfig)
}
