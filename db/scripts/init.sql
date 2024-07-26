USE kabu_db;

DROP TABLE IF EXISTS watering_history;
DROP TABLE IF EXISTS plant_states;
DROP TABLE IF EXISTS plants;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS fertilizer_recipes;

CREATE TABLE locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    shelf VARCHAR(50),
    position VARCHAR(50)
);

CREATE TABLE plants (
    plant_id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT,
    entry_date DATETIME,
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE fertilizer_recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_name VARCHAR(100),
    description TEXT
);

CREATE TABLE watering_history (
    watering_id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT,
    fertilizer_recipe_id INT,
    watering_date DATETIME,
    amount FLOAT,
    description TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    FOREIGN KEY (fertilizer_recipe_id) REFERENCES fertilizer_recipes(recipe_id)
);

CREATE TABLE plant_states (
    state_id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT,
    state_date DATETIME,
    state_type ENUM('seed', 'seedlings', 'flowering', 'fruiting', 'harvested'),
    harvest_weight FLOAT,
    description TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);


-- fertilizer_recipesにデータを挿入
INSERT INTO fertilizer_recipes (recipe_name, description) VALUES
('A液', ''),
('B液', ''),
('C液', ''),
('D液', '');

-- locationsにサンプルデータを挿入
INSERT INTO locations (shelf, position) VALUES
('棚1', 'A1'),
('棚1', 'A2'),
('棚2', 'B1'),
('棚2', 'B2'),
('棚3', 'C1'),
('棚3', 'C2'),
('棚4', 'D1'),
('棚4', 'D2'),
('棚5', 'E1'),
('棚5', 'E2');

-- plantsにサンプルデータを挿入
INSERT INTO plants (location_id, entry_date) VALUES
(1, '2024-07-01 10:00:00'),
(2, '2024-07-02 11:00:00'),
(3, '2024-07-03 09:00:00'),
(4, '2024-07-04 14:00:00'),
(5, '2024-07-05 16:00:00'),
(6, '2024-07-06 10:00:00'),
(7, '2024-07-07 11:00:00'),
(8, '2024-07-08 09:00:00'),
(9, '2024-07-09 14:00:00'),
(10, '2024-07-10 16:00:00');

-- plant_statesにサンプルデータを挿入
INSERT INTO plant_states (plant_id, state_date, state_type, harvest_weight, description) VALUES
(1, '2024-07-01 10:00:00', 'seed', NULL, 'test1'),
(1, '2024-07-01 11:00:00', 'seedlings', NULL, 'test2'),
(1, '2024-07-01 12:00:00', 'flowering', NULL, 'test3'),
(1, '2024-07-02 14:00:00', 'fruiting', NULL, 'test4'),
(1, '2024-07-02 14:00:00', 'harvested', 3.141592, 'test5'),
(2, '2024-07-10 11:00:00', 'seedlings', NULL, 'test2'),
(3, '2024-07-20 09:00:00', 'flowering', NULL, '花が咲いているなう'),
(4, '2024-07-30 14:00:00', 'fruiting', NULL, '実がなり始めた'),
(5, '2024-08-10 16:00:00', 'harvested', 250.5, '収穫完了');

-- watering_historyにサンプルデータを挿入
INSERT INTO watering_history (plant_id, fertilizer_recipe_id, watering_date, amount, description) VALUES
(1, 1, '2024-07-05 10:00:00', 100.0, 'A液を使用'),
(1, 2, '2024-07-06 10:00:00', 100.0, 'B液を使用'),
(1, 3, '2024-07-07 10:00:00', 100.0, 'C液を使用'),
(1, 4, '2024-07-08 10:00:00', 100.0, 'D液を使用'),
(2, 1, '2024-07-10 11:00:00', 150.0, 'A液を使用'),
(2, 2, '2024-07-15 11:00:00', 150.0, 'B液を使用'),
(2, 3, '2024-07-20 11:00:00', 150.0, 'C液を使用'),
(2, 4, '2024-07-25 11:00:00', 150.0, 'D液を使用'),
(3, 1, '2024-07-03 09:00:00', 200.0, 'ほげほげ'),
(3, 2, '2024-07-15 09:00:00', 200.0, 'ふがふが'),
(3, 3, '2024-07-25 09:00:00', 200.0, 'ふがふが'),
(4, 4, '2024-08-05 14:00:00', 250.0, 'D液を使用'),
(5, 1, '2024-08-15 16:00:00', 300.0, 'ほげほげ');
