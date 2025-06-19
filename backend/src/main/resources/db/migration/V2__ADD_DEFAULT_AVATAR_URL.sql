ALTER TABLE users
ALTER COLUMN avatar_url SET DEFAULT 'http://localhost:9000/communify-images/userAvatar/default_avatar.png';

ALTER TABLE groups
ALTER COLUMN image_url SET DEFAULT 'http://localhost:9000/communify-images/groupImage/default_image.png';