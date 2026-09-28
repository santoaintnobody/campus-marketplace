-- Campus Marketplace H2 DDL Schema
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    student_id VARCHAR(255),
    department VARCHAR(255),
    year VARCHAR(255),
    role VARCHAR(50) DEFAULT 'STUDENT',
    profile_image VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    account_active BOOLEAN DEFAULT TRUE,
    rating DOUBLE DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    email_verification_token VARCHAR(255),
    email_verification_token_expiry TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    item_condition VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    contact_preference VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listing_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT uq_fav_user_listing UNIQUE (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id BIGINT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    offer_amount DECIMAL(10,2) NOT NULL,
    counter_amount DECIMAL(10,2),
    message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT NOT NULL,
    reviewed_user_id BIGINT NOT NULL,
    listing_id BIGINT,
    rating INT NOT NULL,
    review TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    listing_id BIGINT,
    reported_user_id BIGINT,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP
);
