package seed

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Seed(pool *pgxpool.Pool) {
	ctx := context.Background()

	seedTemplates(ctx, pool)

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

func seedTemplates(ctx context.Context, pool *pgxpool.Pool) {
	var count int
	err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM habit_templates").Scan(&count)
	if err != nil {
		log.Fatal(err)
	}
	if count > 0 {
		return
	}

	_, err = pool.Exec(ctx, `
		INSERT INTO habit_templates (title, description, frequency) VALUES
		('Пить воду', '2 литра воды в день', 'daily'),
		('Утренняя зарядка', '15 минут упражнений после пробуждения', 'daily'),
		('Читать', '30 минут чтения', 'daily'),
		('Медитация', '10 минут осознанности', 'daily'),
		('Планирование недели', 'Составить план на неделю', 'weekly')
	`)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("templates seed completed")
}
