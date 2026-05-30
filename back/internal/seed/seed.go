package seed

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Seed(pool *pgxpool.Pool) {
	ctx := context.Background()

	var count int
	err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM habits").Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	if count > 0 {
		return
	}

	// user
	_, err = pool.Exec(ctx, `
		INSERT INTO users (email, password_hash, role)
		VALUES ('test@test.com', 'hash', 'user')
	`)
	if err != nil {
		log.Fatal(err)
	}

	// habits
	_, err = pool.Exec(ctx, `
		INSERT INTO habits (user_id, title, description, frequency)
		VALUES (1, 'Drink water', '2L daily', 'daily')
	`)
	if err != nil {
		log.Fatal(err)
	}

	// check-ins
	_, err = pool.Exec(ctx, `
		INSERT INTO check_ins (habit_id, completed_at)
		VALUES (1, NOW())
	`)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("seed completed")
}
