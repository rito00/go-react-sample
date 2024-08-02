package main

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
  "time"

  _ "github.com/go-sql-driver/mysql"
  "github.com/gorilla/mux"
  "github.com/rs/cors"
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
)

func main() {
  dsn := "kabu:kabu@tcp(db:3306)/kabu_db?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
  if err != nil {
    log.Fatal("Database connection error: ", err)
  }

  // Routerの登録
  router := mux.NewRouter()
	// GET
  router.HandleFunc("/api/plants", getPlants(db)).Methods("GET")
  router.HandleFunc("/api/watering-history", getWateringHistory(db)).Methods("GET")
  router.HandleFunc("/api/state-history", getStateHistory(db)).Methods("GET")
	router.HandleFunc("/api/state-types", getStateTypes(db)).Methods("GET")
	router.HandleFunc("/api/shelves", getShelves(db)).Methods("GET")
	router.HandleFunc("/api/levels", getLevels(db)).Methods("GET")
	router.HandleFunc("/api/positions", getPositions(db)).Methods("GET")
	router.HandleFunc("/api/position", getPosition(db)).Methods("GET")

	// POST
	router.HandleFunc("/api/plants", registerPlant(db)).Methods("POST")

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

// executeQueryAndRespond は、クエリを実行し、結果をJSONとして返す
func executeQueryAndRespond(w http.ResponseWriter, db *gorm.DB, query *gorm.DB, result interface{}) {
	if err := query.Scan(result).Error; err != nil {
			log.Printf("Database query error: %v", err)
			http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
			return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
			log.Printf("JSON encoding error: %v", err)
			http.Error(w, fmt.Sprintf("JSON encoding error: %v", err), http.StatusInternalServerError)
			return
	}
}

func getPlants(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var plants []Plant
			query := db.Table("plants").
					Select("plants.plant_id, shelves.name AS shelf, levels.level_number AS level, positions.position_number AS position, plants.entry_date, plant_states.state_type AS state_type").
					Joins("JOIN positions ON plants.position_id = positions.id").
					Joins("JOIN levels ON positions.level_id = levels.id").
					Joins("JOIN shelves ON levels.shelf_id = shelves.id").
					Joins("LEFT JOIN (SELECT ps.plant_id, ps.state_type FROM plant_states ps INNER JOIN (SELECT plant_id, MAX(state_date) as max_date FROM plant_states GROUP BY plant_id) pmax ON ps.plant_id = pmax.plant_id AND ps.state_date = pmax.max_date) AS plant_states ON plants.plant_id = plant_states.plant_id")

			executeQueryAndRespond(w, db, query, &plants)
	}
}

func getWateringHistory(db *gorm.DB) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    var wateringHistory []Watering
    query := db.Table("watering_history").
      Select("watering_history.watering_date, watering_history.amount, fertilizer_recipes.recipe_name, watering_history.description").
      Joins("JOIN plants ON plants.plant_id = watering_history.plant_id").
      Joins("LEFT JOIN fertilizer_recipes ON watering_history.fertilizer_recipe_id = fertilizer_recipes.recipe_id").
      Order("watering_history.watering_date DESC")

    if plantID := r.URL.Query().Get("plant_id"); plantID != "" {
      query = query.Where("plants.plant_id = ?", plantID)
    }

    executeQueryAndRespond(w, db, query, &wateringHistory)
  }
}

func getStateHistory(db *gorm.DB) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
      var stateHistory []PlantState
      query := db.Table("plant_states").
          Select("plant_states.state_date, plant_states.state_type, harvest_weight, plant_states.description").
          Joins("JOIN plants ON plants.plant_id = plant_states.plant_id").
          Order("plant_states.state_date DESC")

      if plantID := r.URL.Query().Get("plant_id"); plantID != "" {
          query = query.Where("plants.plant_id = ?", plantID)
      }

      executeQueryAndRespond(w, db, query, &stateHistory)
  }
}

func getShelves(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var shelves []Shelf
			query := db.Table("shelves").
					Select("id, name")
			executeQueryAndRespond(w, db, query, &shelves)
	}
}

func getLevels(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var levels []Level
			shelfID := r.URL.Query().Get("shelf_id")
			if shelfID == "" {
					http.Error(w, "Missing shelf_id parameter", http.StatusBadRequest)
					return
			}
			query := db.Table("levels").
					Select("id, level_number").
					Where("shelf_id = ?", shelfID)
			executeQueryAndRespond(w, db, query, &levels)
	}
}

func getPositions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var positions []Position
			levelID := r.URL.Query().Get("level_id")
			if levelID == "" {
					http.Error(w, "Missing level_id parameter", http.StatusBadRequest)
					return
			}
			query := db.Table("positions").
					Select("id, position_number").
					Where("level_id = ?", levelID)
			executeQueryAndRespond(w, db, query, &positions)
	}
}

func getStateTypes(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var stateTypes []string
			query := db.Table("plant_states").
					Select("DISTINCT state_type").
					Order("state_type")

			executeQueryAndRespond(w, db, query, &stateTypes)
	}
}

func registerPlant(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var newPlant RegisterPlantRequest
			if err := json.NewDecoder(r.Body).Decode(&newPlant); err != nil {
					http.Error(w, "Invalid request body", http.StatusBadRequest)
					return
			}

			// トランザクションを開始
			tx := db.Begin()
			defer func() {
					if r := recover(); r != nil {
							tx.Rollback()
					}
			}()

			// 1. Positionを取得
			log.Printf("Searching for position: Shelf ID: %d, Level Number: %d, Position Number: %d", newPlant.Shelf, newPlant.Level, newPlant.Position)

			var position Position
			if err := tx.Table("positions").
					Select("positions.id").
					Joins("JOIN levels ON positions.level_id = levels.id").
					Joins("JOIN shelves ON levels.shelf_id = shelves.id").
					Where("shelves.id = ? AND levels.id = ? AND positions.id = ?", newPlant.Shelf, newPlant.Level, newPlant.Position).
					First(&position).Error; err != nil {
					tx.Rollback()
					http.Error(w, "Position not found", http.StatusNotFound)
				return
			}

			// 2. plantsテーブルに新しいレコードを作成
			plant := RegisterPlant{
					PositionID: position.ID,
					EntryDate:  time.Now(),
			}
			if err := tx.Table("plants").Create(&plant).Error; err != nil {
					tx.Rollback()
					http.Error(w, fmt.Sprintf("Failed to create plant record: %v", err), http.StatusInternalServerError)
					return
			}

			// 3. plant_statesテーブルに新しいレコードを作成
			plantState := PlantState{
					PlantID:   plant.PlantID,
					Date:      time.Now(),
					StateType: newPlant.State,
			}
			if newPlant.State == "harvested" && newPlant.HarvestedAmount != nil {
				plantState.HarvestWeight = *newPlant.HarvestedAmount
		}
		if err := tx.Create(&plantState).Error; err != nil {
				tx.Rollback()
				http.Error(w, "Failed to create plant state record", http.StatusInternalServerError)
				return
		}

			// トランザクションをコミット
			if err := tx.Commit().Error; err != nil {
					http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
					return
			}

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]uint{"plant_id": plant.PlantID})
	}
}

func getPosition(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			positionID := r.URL.Query().Get("position_id")
			if positionID == "" {
					http.Error(w, "Missing position_id parameter", http.StatusBadRequest)
					return
			}

			var result struct {
					ShelfName      string `json:"shelf_name"`
					LevelNumber    int    `json:"level_number"`
					PositionNumber int    `json:"position_number"`
			}

			query := db.Raw(`
					SELECT s.name AS shelf_name, l.level_number, p.position_number
					FROM positions p
					JOIN levels l ON p.level_id = l.id
					JOIN shelves s ON l.shelf_id = s.id
					WHERE p.id = ?
			`, positionID)

			if err := query.Scan(&result).Error; err != nil {
					log.Printf("Error querying database: %v", err)
					if err == gorm.ErrRecordNotFound {
							http.Error(w, "Position not found", http.StatusNotFound)
					} else {
							log.Printf("Database query error: %v", err)
							http.Error(w, fmt.Sprintf("Internal server error: %v", err), http.StatusInternalServerError)
					}
					return
			}

			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(result); err != nil {
					log.Printf("Error encoding JSON: %v", err)
					http.Error(w, "Error encoding response", http.StatusInternalServerError)
					return
			}
	}
}