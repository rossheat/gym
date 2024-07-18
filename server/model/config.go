package model

type Config struct {
	ServerAddress             string
	AllowedOrigins            []string
	Env                       string
	PostgresMigrationSteps    int64
	ClerkBase64EncodedPEMKey  string
	AWSCloudWatchLogGroupName string
	AWSRegion                 string
	AWSS3BucketName           string
	PostgresConnectionParams
}
