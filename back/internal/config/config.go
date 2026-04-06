package config

import (
	"fmt"
	"time"
)

type Config struct {
	ENV      string
	HTTP     HTTPConfig
	Postgres PostgresConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type HTTPConfig struct {
	Host        string
	Port        int
	Timeout     time.Duration
	IdleTimeout time.Duration
}

type PostgresConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DB       string
	SSLMode  string
	Timeout  time.Duration
}

type RedisConfig struct {
	Host    string
	Port    int
	Timeout time.Duration
}

type JWTConfig struct {
	JWTSecret  string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

func LoadConfig() (*Config, error) {
	cfg := &Config{
		ENV: getEnv("ENV", "local"),

		HTTP: HTTPConfig{
			Host:        getEnv("APP_HOST", "0.0.0.0"),
			Port:        getEnvAsInt("APP_PORT", 8080),
			Timeout:     getEnvAsDuration("APP_TIMEOUT", 10*time.Second),
			IdleTimeout: getEnvAsDuration("APP_IDLE_TIMEOUT", 60*time.Second),
		},

		Postgres: PostgresConfig{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnvAsInt("POSTGRES_PORT", 5435),
			User:     getEnv("POSTGRES_USER", ""),
			Password: getEnv("POSTGRES_PASSWORD", ""),
			DB:       getEnv("POSTGRES_DB", ""),
			SSLMode:  getEnv("POSTGRES_SSL_MODE", "disable"),
			Timeout:  getEnvAsDuration("POSTGRES_TIMEOUT", 5*time.Second),
		},

		Redis: RedisConfig{
			Host:    getEnv("REDIS_HOST", "localhost"),
			Port:    getEnvAsInt("REDIS_PORT", 6379),
			Timeout: getEnvAsDuration("REDIS_TIMEOUT", 3*time.Second),
		},

		JWT: JWTConfig{
			JWTSecret:  getEnv("JWT_SECRET", ""),
			AccessTTL:  getEnvAsDuration("JWT_ACCESS_TTL", 24*time.Hour),
			RefreshTTL: getEnvAsDuration("JWT_REFRESH_TTL", 168*time.Hour),
		},
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.HTTP.Port <= 0 {
		return fmt.Errorf("HTTP.Port must be greater than 0")
	}

	if c.HTTP.Timeout <= 0 {
		return fmt.Errorf("HTTP.Timeout must be greater than 0")
	}

	if c.HTTP.IdleTimeout <= 0 {
		return fmt.Errorf("HTTP.IdleTimeout must be greater than 0")
	}

	if c.Postgres.Host == "" {
		return fmt.Errorf("Postgres.Host is required")
	}

	if c.Postgres.Port <= 0 {
		return fmt.Errorf("Postgres.Port must be greater than 0")
	}

	if c.Postgres.User == "" {
		return fmt.Errorf("Postgres.User is required")
	}

	if c.Postgres.Password == "" {
		return fmt.Errorf("Postgres.Password is required")
	}

	if c.Postgres.DB == "" {
		return fmt.Errorf("Postgres.DB is required")
	}

	if c.Postgres.Timeout <= 0 {
		return fmt.Errorf("Postgres.Timeout must be greater than 0")
	}

	if c.Redis.Host == "" {
		return fmt.Errorf("Redis.Host is required")
	}

	if c.Redis.Port <= 0 {
		return fmt.Errorf("Redis.Port must be greater than 0")
	}

	if c.Redis.Timeout <= 0 {
		return fmt.Errorf("Redis.Timeout must be greater than 0")
	}

	if c.JWT.JWTSecret == "" {
		return fmt.Errorf("JWT.JWTSecret is required")
	}

	if c.JWT.AccessTTL <= 0 {
		return fmt.Errorf("JWT.AccessTTL must be greater than 0")
	}

	if c.JWT.RefreshTTL <= 0 {
		return fmt.Errorf("JWT.RefreshTTL must be greater than 0")
	}

	if c.JWT.AccessTTL > c.JWT.RefreshTTL {
		return fmt.Errorf("JWT.RefreshTTL must be greater than or equal to JWT.AccessTTL")
	}

	return nil
}
