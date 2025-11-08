--New register
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Change register to admin type
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;
-- delete Tony's register
DELETE FROM account
WHERE account_id = 1;
-- Update part of description of an item
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    );
-- Join tables by classification_name (a feature)
SELECT inv_make,
    inv_model,
    classification_name
FROM inventory
    INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';
-- Add vehicles path to images  
UPDATE inventory
SET inv_image = REPLACE (inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE (inv_thumbnail, '/images', '/images/vehicles');