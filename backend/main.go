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
  router.HandleFunc("/api/locations", getLocations(db)).Methods("GET")
	router.HandleFunc("/api/state-types", getStateTypes(db)).Methods("GET")
	router.HandleFunc("/api/shelves", getShelves(db)).Methods("GET")

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
      http.Error(w, "Internal server error", http.StatusInternalServerError)
      return
  }

  w.Header().Set("Content-Type", "application/json")
  if err := json.NewEncoder(w).Encode(result); err != nil {
      log.Printf("JSON encoding error: %v", err)
      http.Error(w, "Internal server error", http.StatusInternalServerError)
      return
  }
}


func getPlants(db *gorm.DB) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    var plants []Plant
    query := db.Table("plants").
      Select("plants.plant_id, locations.shelf, locations.position, plants.entry_date, COALESCE(plant_states.state_type, '未設定') as state_type").
      Joins("JOIN locations ON plants.location_id = locations.location_id").
      Joins("LEFT JOIN plant_states ON plants.plant_id = plant_states.plant_id")

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

func getLocations(db *gorm.DB) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
      var locations []Location
      query := db.Table("locations").
          Select("location_id, shelf, position").
          Order("shelf, position")

      executeQueryAndRespond(w, db, query, &locations)
  }
}

func getShelves(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
			var shelves []string
			query := db.Table("shelves").
					Select("shelf_name")

			executeQueryAndRespond(w, db, query, &shelves)
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
			var newPlant NewPlant
			if err := json.NewDecoder(r.Body).Decode(&newPlant); err != nil {
					http.Error(w, "Invalid request body", http.StatusBadRequest)
					return
			}

			// トランザクションを開始
			tx := db.Begin()

			// 1. locationを取得
			var location Location
			if err := tx.Where("shelf = ? AND position = ?", newPlant.Shelf, newPlant.Position).First(&location).Error; err != nil {
					tx.Rollback()
					http.Error(w, "Location not found", http.StatusNotFound)
					return
			}

			// 2. plantsテーブルに新しいレコードを作成
			plant := RegisterPlant{
					LocationID: location.LocationID,
					EntryDate:  time.Now(),
			}
			if err := tx.Table("plants").Create(&plant).Error; err != nil {
					tx.Rollback()
					http.Error(w, "Failed to create plant", http.StatusInternalServerError)
					return
			}

			// 3. plant_statesテーブルに新しいレコードを作成
			plantState := PlantState{
					PlantID:   plant.PlantID,
					Date:      time.Now(),
					StateType: newPlant.State,
			}
			if err := tx.Table("plant_states").Create(&plantState).Error; err != nil {
					tx.Rollback()
					http.Error(w, "Failed to create plant state", http.StatusInternalServerError)
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