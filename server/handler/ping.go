package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/loggerpkg"
)

func Ping(ctx *gin.Context) {
	logger := ctx.MustGet("logger").(*loggerpkg.Logger)
	logger.LogEvent("ping", map[string]interface{}{"message": "pong"})
	ctx.String(http.StatusOK, "pong")
}
