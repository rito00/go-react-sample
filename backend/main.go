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

type Watering struct {
  ID                   uint      `gorm:"column:id" json:"-"`
  PlantID              uint      `gorm:"column:plant_id" json:"plant_id"`
  WateringDate         time.Time `gorm:"column:watering_date" json:"watering_date"`
  Amount               float64   `gorm:"column:amount" json:"amount"`
  FertilizerRecipeName string    `gorm:"column:recipe_name" json:"fertilizer_recipe_name"`
  Description          string    `gorm:"column:description" json:"description"`
}

type PlantState struct {
  ID            uint            `gorm:"column:id" json:"-"`
  PlantID       uint            `gorm:"column:plant_id" json:"plant_id"`
  Date          time.Time       `gorm:"column:state_date" json:"state_date"`
  StateType     string          `gorm:"column:state_type" json:"state_type"`
  HarvestWeight float64         `gorm:"column:harvest_weight" json:"harvest_weight"`
  Description   string          `gorm:"column:description" json:"description"`
}

type Location struct {
  LocationID uint   `gorm:"primaryKey" json:"location_id"`
  Shelf      string `json:"shelf"`
  Position   string `json:"position"`
}

func main() {
  dsn := "kabu:kabu@tcp(db:3306)/kabu_db?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
  if err != nil {
    log.Fatal("Database connection error: ", err)
  }

  // Routerの登録
  router := mux.NewRouter()
  router.HandleFunc("/api/plants", getPlants(db)).Methods("GET")
  router.HandleFunc("/api/watering-history", getWateringHistory(db)).Methods("GET")
  router.HandleFunc("/api/state-history", getStateHistory(db)).Methods("GET")
  router.HandleFunc("/api/locations", getAllLocations(db)).Methods("GET")

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

func getAllLocations(db *gorm.DB) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
      var locations []Location
      query := db.Table("locations").
          Select("location_id, shelf, position").
          Order("shelf, position")

      executeQueryAndRespond(w, db, query, &locations)
  }
}