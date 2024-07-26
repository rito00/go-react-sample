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

type Plant struct {
  PlantID   uint   `gorm:"primaryKey" json:"plant_id"`
  Shelf     string `json:"shelf"`
  Position  string `json:"position"`
  EntryDate string `json:"entry_date"`
  StateType string `json:"state_type"`
}

type WateringHistory struct {
  ID                   uint      `gorm:"primaryKey"`
  PlantID              uint      `json:"plant_id"`
  WateringDate         time.Time `json:"watering_date"`
  FertilizerRecipeName string    `json:"fertilizer_recipe_name"`
  Amount               float64   `json:"amount"`
  Description          string    `json:"description"`
}

func main() {
  dsn := "kabu:kabu@tcp(db:3306)/kabu_db?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
  if err != nil {
    log.Fatal("Database connection error: ", err)
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
    var wateringHistory []WateringHistory
    query := db.Table("watering_history").
      Select("watering_history.watering_date, watering_history.amount, fertilizer_recipes.recipe_name, fertilizer_recipes.description").
      Joins("JOIN plants ON plants.plant_id = watering_history.plant_id").
      Joins("LEFT JOIN fertilizer_recipes ON watering_history.fertilizer_recipe_id = fertilizer_recipes.recipe_id").
      Order("watering_history.watering_date DESC")

    if plantID := r.URL.Query().Get("plant_id"); plantID != "" {
      query = query.Where("plants.plant_id = ?", plantID)
    }

    executeQueryAndRespond(w, db, query, &wateringHistory)
  }
}
