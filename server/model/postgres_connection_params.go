package model

type PostgresConnectionParams struct {
	Username string
	Password string
	Host     string
	Port     string
	Database string
	SSLMode  string
}
