package middleware

import "github.com/gin-gonic/gin"

func Set[K string, V any](key K, value V) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(string(key), value)
		ctx.Next()
	}
}
