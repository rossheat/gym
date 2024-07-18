package awspkg

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/model"
)

type AWSSession struct {
	Session *session.Session
}

func NewAWSSession(cfg *model.Config) (*AWSSession, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: &cfg.AWSRegion,
	})
	if err != nil {
		return nil, fmt.Errorf("error creating AWS session: %w", err)
	}
	return &AWSSession{Session: sess}, nil
}

func (a *AWSSession) GetCloudWatchLogsService() *cloudwatchlogs.CloudWatchLogs {
	return cloudwatchlogs.New(a.Session)
}

func (a *AWSSession) GetS3Service() *s3.S3 {
	return s3.New(a.Session)
}

func AWSSessionMiddleware(awsSession *AWSSession) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("awsSession", awsSession)
		c.Next()
	}
}
