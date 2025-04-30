import os
import shutil
import random

# Set your main dataset folder
original_dataset_dir = 'PlantVillage'   # your current folder where all images are
base_dir = 'dataset'                     # new folder to create

train_dir = os.path.join(base_dir, 'train')
val_dir = os.path.join(base_dir, 'val')

# Create directories
os.makedirs(train_dir, exist_ok=True)
os.makedirs(val_dir, exist_ok=True)

# List all categories (folder names)
categories = os.listdir(original_dataset_dir)

# Split ratio
split_ratio = 0.8   # 80% training, 20% validation

# Only consider image extensions
image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')

for category in categories:
    category_path = os.path.join(original_dataset_dir, category)
    
    if not os.path.isdir(category_path):
        continue

    # Only take image files
    images = [img for img in os.listdir(category_path) if img.lower().endswith(image_extensions)]
    random.shuffle(images)

    split_point = int(len(images) * split_ratio)
    train_images = images[:split_point]
    val_images = images[split_point:]

    os.makedirs(os.path.join(train_dir, category), exist_ok=True)
    os.makedirs(os.path.join(val_dir, category), exist_ok=True)

    for img in train_images:
        src = os.path.join(category_path, img)
        dst = os.path.join(train_dir, category, img)
        shutil.copy2(src, dst)

    for img in val_images:
        src = os.path.join(category_path, img)
        dst = os.path.join(val_dir, category, img)
        shutil.copy2(src, dst)

print("✅ Dataset split successfully into 'train/' and 'val/' folders.")
