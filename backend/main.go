package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Plant struct {
	PlantID   int    `json:"plant_id"`
	Shelf     string `json:"shelf"`
	Position  string `json:"position"`
	EntryDate string `json:"entry_date"`
	StateType string `json:"state_type"`
}

type WateringHistory struct {
	PlantID            int       `json:"plant_id"`
	WateringDate       time.Time `json:"watering_date"`
	FertilizerRecipeID int       `json:"fertilizer_recipe_id"`
	Amount             float64   `json:"amount"`
	AdditionalInfo     string    `json:"additional_info"`
}

func main() {
	db, err := sql.Open("mysql", "kabu:kabu@tcp(db:3306)/kabu_db?parseTime=true")
	if err != nil {
		log.Fatal("Database connection error: ", err)
	}
	defer db.Close()

	// データベース接続を確認
	err = db.Ping()
	if err != nil {
		log.Fatal("Database ping error: ", err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/api/plants", getPlants(db)).Methods("GET")
	router.HandleFunc("/api/watering-history", getWateringHistory(db)).Methods("GET")

	// CORS の設定
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func getPlants(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var plants []Plant
		query := `
            SELECT p.plant_id, l.shelf, l.position, p.entry_date, COALESCE(ps.state_type, '未設定') as state_type
            FROM plants p
            JOIN locations l ON p.location_id = l.location_id
            LEFT JOIN plant_states ps ON p.plant_id = ps.plant_id
        `
		rows, err := db.Query(query)
		if err != nil {
			log.Printf("Database query error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var p Plant
			if err := rows.Scan(&p.PlantID, &p.Shelf, &p.Position, &p.EntryDate, &p.StateType); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}
			plants = append(plants, p)
		}

		if err := rows.Err(); err != nil {
			log.Printf("Row iteration error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(plants); err != nil {
			log.Printf("JSON encoding error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}
}

func getWateringHistory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var wateringHistory []WateringHistory
		var query string
		var args []interface{}
		plantID := r.URL.Query().Get("plant_id")

		if plantID != "" {
				query = `
						SELECT p.plant_id, p.location_id, w.watering_date, w.amount, f.recipe_name
						FROM plants p
						JOIN watering_history w ON p.plant_id = w.plant_id
						LEFT JOIN fertilizer_recipes f ON w.fertilizer_recipe_id = f.recipe_id
						WHERE p.plant_id = ? 
						ORDER BY w.watering_date DESC;
				`
				args = append(args, plantID)
		} else {
				query = `
						SELECT p.plant_id, p.location_id, w.watering_date, w.amount, f.recipe_name
						FROM plants p
						JOIN watering_history w ON p.plant_id = w.plant_id
						LEFT JOIN fertilizer_recipes f ON w.fertilizer_recipe_id = f.recipe_id
						ORDER BY w.watering_date DESC;
				`
		}

		rows, err := db.Query(query, args...)
		if err != nil {
			log.Printf("Database query error: %v", err)
			http.Error(w, "Internal server error1", http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		
		for rows.Next() {
			var wh WateringHistory
			if err := rows.Scan(&wh.PlantID, &wh.FertilizerRecipeID, &wh.WateringDate, &wh.Amount, &wh.AdditionalInfo); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Internal server error2", http.StatusInternalServerError)
				return
			}
			wateringHistory = append(wateringHistory, wh)
		}
		
		if err := rows.Err(); err != nil {
			log.Printf("Row iteration error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(wateringHistory); err != nil {
			log.Printf("JSON encoding error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}
}
