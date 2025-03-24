
-- Create database
CREATE DATABASE IF NOT EXISTS interpreter_tracker;
USE interpreter_tracker;

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    minute_rate DECIMAL(10,4) NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    coordinates JSON NOT NULL,
    visit_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interpreters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    languages JSON,
    assignment_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    notes TEXT,
    interpreter_id VARCHAR(50),
    language VARCHAR(50),
    paid BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (interpreter_id) REFERENCES interpreters(id)
);

-- Create user with proper permissions (change password in production)
CREATE USER IF NOT EXISTS 'interpreter_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON interpreter_tracker.* TO 'interpreter_user'@'localhost';
FLUSH PRIVILEGES;

-- Insert initial data
-- (Add your initial data insertion here similar to your initialData in the frontend)
