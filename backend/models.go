package main

import (
	"time"
)

type Plant struct {
	PlantID   uint   `gorm:"column:plant_id" json:"plant_id"`
	Shelf     string `gorm:"column:shelf" json:"shelf"`
	Level     string `gorm:"column:level" json:"level"`
	Position  string `gorm:"column:position" json:"position"`
	EntryDate string `gorm:"column:entry_date" json:"entry_date"`
	StateType string `gorm:"column:state_type" json:"state_type"`
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

type NewPlant struct {
	Shelf    string `json:"shelf"`
	Position string `json:"position"`
	State    string `json:"state"`
}

type RegisterPlant struct {
	PlantID    uint      `gorm:"primaryKey;column:plant_id" json:"plant_id"`
	LocationID uint      `gorm:"column:location_id" json:"location_id"`
	EntryDate  time.Time `gorm:"column:entry_date" json:"entry_date"`
}

type Shelf struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Level struct {
	ID          int `json:"id"`
	LevelNumber int `json:"level_number"`
}

type Position struct {
	ID             int `json:"id"`
	PositionNumber int `json:"position_number"`
}
