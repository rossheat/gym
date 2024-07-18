package middleware

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/model"
)

func ClerkAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		config := c.MustGet("config").(*model.Config)

		sessionToken := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")

		// Decode the Base64 encoded PEM key
		decodedBytes, err := base64.StdEncoding.DecodeString(config.ClerkBase64EncodedPEMKey)
		if err != nil {
			log.Println("Error decoding PEM key:", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error (PEM decode)"})
			return
		}
		pem := string(decodedBytes)

		jwk, err := clerk.JSONWebKeyFromPEM(pem)
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error (PEM)"})
			return
		}

		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token:  sessionToken,
			JWK:    jwk,
			Leeway: 5 * time.Second,
		})

		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"access": "unauthorized"})
			return
		}

		c.Set("userId", claims.Subject)
		c.Next()
	}
}
