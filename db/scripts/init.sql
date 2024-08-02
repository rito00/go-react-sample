USE kabu_db;
DROP TABLE IF EXISTS watering_history;
DROP TABLE IF EXISTS plant_states;
DROP TABLE IF EXISTS plants;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS shelves;
DROP TABLE IF EXISTS fertilizer_recipes;

CREATE TABLE shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shelf_id INT NOT NULL,
    level_number INT NOT NULL,
    FOREIGN KEY (shelf_id) REFERENCES shelves(id),
    UNIQUE KEY (shelf_id, level_number)
);

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT NOT NULL,
    position_number INT NOT NULL,
    FOREIGN KEY (level_id) REFERENCES levels(id),
    UNIQUE KEY (level_id, position_number)
);

CREATE TABLE plants (
    plant_id INT PRIMARY KEY AUTO_INCREMENT,
    position_id INT UNIQUE,
    entry_date DATETIME,
    FOREIGN KEY (position_id) REFERENCES positions(id)
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
INSERT INTO fertilizer_recipes (recipe_name) VALUES
('A液'),
('B液'),
('C液'),
('D液');

-- shelvesにデータを挿入
INSERT INTO shelves (name) VALUES
('A棚'),
('B棚'),
('C棚'),
('D棚'),
('E棚');

-- levelsにデータを挿入
INSERT INTO levels (shelf_id, level_number) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5);

-- positionsにデータを挿入 (各棚の各レベルに20個のpositionを持つ)
INSERT INTO positions (level_id, position_number)
SELECT l.id, p.position_number
FROM levels l
CROSS JOIN (
    SELECT 1 AS position_number UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
    UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
) p
ORDER BY l.id, p.position_number;


-- plantsにサンプルデータを挿入 0 - 100くらいまで適当に
-- 一時テーブルを作成して各棚からランダムなポジションを選択
CREATE TEMPORARY TABLE temp_random_positions AS
SELECT p.id AS position_id
FROM positions p
JOIN levels l ON p.level_id = l.id
JOIN shelves s ON l.shelf_id = s.id
GROUP BY s.id, p.id
ORDER BY RAND();

-- plantsテーブルにデータを挿入
INSERT INTO plants (position_id, entry_date)
SELECT 
    position_id,
    DATE_ADD('2024-07-01', INTERVAL FLOOR(RAND() * 60) DAY) AS entry_date
FROM 
    temp_random_positions
LIMIT 50;

-- 一時テーブルを削除
DROP TEMPORARY TABLE temp_random_positions;


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
