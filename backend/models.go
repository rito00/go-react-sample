package main

import (
	"time"
)

type Plant struct {
  PlantID   uint   `gorm:"primaryKey" json:"plant_id"`
	LocationID uint   `json:"-"`
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