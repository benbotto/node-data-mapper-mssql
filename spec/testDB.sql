CREATE DATABASE testDB;
GO;

USE testDB;
GO;

CREATE TABLE users (
  userID INT NOT NULL PRIMARY KEY IDENTITY,
  firstName NVARCHAR(255),
  lastName NVARCHAR(255)
);
GO;

INSERT INTO users (firstName, lastName) VALUES ('Bill', 'Stole')
INSERT INTO users (firstName, lastName) VALUES ('Rachael', 'Ramero')
INSERT INTO users (firstName, lastName) VALUES ('Jack', 'Sewther')
INSERT INTO users (firstName, lastName) VALUES ('Andy', 'Berg')
GO;

CREATE TABLE phone_numbers (
  phoneNumberID INT NOT NULL PRIMARY KEY IDENTITY,
  userID INT NOT NULL,
  phoneNumber NVARCHAR(50) NOT NULL,
  [type] NVARCHAR(20), 
  CONSTRAINT fk_userID_users_userID FOREIGN KEY (userID) REFERENCES users(userID)
)
GO;

INSERT INTO phone_numbers (userID, phoneNumber, [type]) VALUES (1, '123-456-7890', 'Home')
INSERT INTO phone_numbers (userID, phoneNumber, [type]) VALUES (1, '222-333-4444', 'Mobile')
INSERT INTO phone_numbers (userID, phoneNumber, [type]) VALUES (2, '666-458-4875', 'Mobile')
INSERT INTO phone_numbers (userID, phoneNumber, [type]) VALUES (3, '771-214-5487', 'Mobile')
INSERT INTO phone_numbers (userID, phoneNumber, [type]) VALUES (3, '879-987-1587', 'Home')
GO;


CREATE TABLE photos (
  photoID INT NOT NULL PRIMARY KEY IDENTITY,
  photoURL NVARCHAR(255) NOT NULL,
  largeThumbnailID INT,
  smallThumbnailID INT,
  prodID INT NOT NULL,
  CONSTRAINT fk_largeThumbnailID_photos_photoID FOREIGN KEY (largeThumbnailID) REFERENCES photos(photoID),
  CONSTRAINT fk_smallThumbnailID_photos_photoID FOREIGN KEY (smallThumbnailID) REFERENCES photos(photoID)
);
GO;

CREATE TABLE products (
  productID INT NOT NULL PRIMARY KEY IDENTITY,
  description NVARCHAR(255) NOT NULL,
  isActive BIT NOT NULL DEFAULT 1,
  primaryPhotoID INT,
  CONSTRAINT fk_primaryPhotoID_photos_photoID FOREIGN KEY (primaryPhotoID) REFERENCES photos(photoID)
);
GO;

ALTER TABLE photos ADD CONSTRAINT fk_prodID_products_productID FOREIGN KEY (prodID) REFERENCES products(productID);
GO;

INSERT INTO products (description) VALUES ('Nike Shoes')
INSERT INTO products (description) VALUES ('Haro Bikes')
INSERT INTO products (description) VALUES ('Smelly Candles')
GO;

INSERT INTO photos (photoURL, prodID) VALUES ('http://foo.com/nike-large.jpg', 1)
INSERT INTO photos (photoURL, prodID) VALUES ('http://foo.com/nike-small.jpg', 1)
INSERT INTO photos (photoURL, largeThumbnailID, smallThumbnailID, prodID) VALUES ('http://foo.com/nike.jpg', 1, 2, 1)

UPDATE products SET
primaryPhotoID = 3
WHERE  productID = 1

