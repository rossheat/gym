package loggerpkg

import (
	"encoding/json"
	"fmt"
	"log"
	"runtime"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rossheat/gym/server/awspkg"
	"github.com/rossheat/gym/server/model"
)

type Logger struct {
	Service       *cloudwatchlogs.CloudWatchLogs
	LogGroupName  string
	SequenceToken *string
	StreamName    model.Env
	Environment   model.Env
}

func NewLogger(awsSession *awspkg.AWSSession, cfg *model.Config) *Logger {
	svc := cloudwatchlogs.New(awsSession.Session)
	return &Logger{
		Service:      svc,
		LogGroupName: cfg.AWSCloudWatchLogGroupName,
		StreamName:   model.Env(cfg.Env),
		Environment:  model.Env(cfg.Env),
	}
}

func (l *Logger) LogRequestMetadata(c *gin.Context, start time.Time, latency time.Duration) {
	logDetails := l.getLogDetails(c)
	logDetails["latency"] = latency.String()
	l.LogEvent("request_metadata", logDetails)
}

func (l *Logger) LogHandlerError(c *gin.Context, err error, when string) {
	logDetails := l.getLogDetails(c)
	logDetails["error_message"] = err.Error()
	logDetails["location"] = l.getCallerLocation(2)
	logDetails["when"] = when
	l.LogEvent("handler_error", logDetails)
}

func (l *Logger) LogHandlerInfo(c *gin.Context, message string) {
	logDetails := l.getLogDetails(c)
	logDetails["message"] = message
	logDetails["location"] = l.getCallerLocation(2)
	l.LogEvent("handler_info", logDetails)
}

func (l *Logger) getLogDetails(c *gin.Context) map[string]interface{} {
	return map[string]interface{}{
		"timestamp":   time.Now().Format(time.RFC3339),
		"request_id":  c.GetString("requestID"),
		"http_method": c.Request.Method,
		"endpoint":    c.Request.URL.Path,
		"http_status": c.Writer.Status(),
		"client_ip":   c.ClientIP(),
		"user_id":     c.GetString("userId"),
	}
}

func (l *Logger) getCallerLocation(skip int) string {
	pc, file, line, _ := runtime.Caller(skip)
	funcName := runtime.FuncForPC(pc).Name()
	return fmt.Sprintf("%s - %s:%d", funcName, file, line)
}

func (l *Logger) LogEvent(eventType string, logDetails map[string]interface{}) {

	logDetails["event_type"] = eventType

	logJSON, err := json.Marshal(logDetails)
	if err != nil {
		log.Printf("Error marshaling log details: %v", err)
		return
	}

	if l.Environment == model.EnvDevelopment {
		log.Printf("[%s] %s", eventType, string(logJSON))
	}

	input := &cloudwatchlogs.PutLogEventsInput{
		LogGroupName:  aws.String(l.LogGroupName),
		LogStreamName: aws.String(string(l.StreamName)),
		LogEvents: []*cloudwatchlogs.InputLogEvent{
			{
				Message:   aws.String(string(logJSON)),
				Timestamp: aws.Int64(time.Now().UnixNano() / int64(time.Millisecond)),
			},
		},
	}
	if l.SequenceToken != nil {
		input.SequenceToken = l.SequenceToken
	}

	resp, err := l.Service.PutLogEvents(input)
	if err != nil {
		log.Println("error logging CloudWatch event:", err)
		return
	}
	l.SequenceToken = resp.NextSequenceToken
}

func LoggingMiddleware(logger *Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := uuid.New().String()
		c.Set("requestID", requestID)

		start := time.Now()
		c.Next()
		latency := time.Since(start)

		logger.LogRequestMetadata(c, start, latency)
	}
}
