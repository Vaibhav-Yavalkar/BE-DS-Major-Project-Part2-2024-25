import os
import random
import numpy as np
from tensorflow.keras.preprocessing import image

# Path to your image folder
image_folder = 'E:\VSCode\leaf-disease-detection\PlantVillage\Tomato_Late_blight'

# Path where you want to save flattened images
output_folder = 'path/to/save/flattened_images'

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# List all image files
all_images = [img for img in os.listdir(image_folder) if img.lower().endswith(('.png', '.jpg', '.jpeg'))]

# Pick 100 random images
random_images = random.sample(all_images, 100)

for idx, img_name in enumerate(random_images):
    img_path = os.path.join(image_folder, img_name)
    
    # Load and preprocess
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0  # Normalize
    img_flattened = img_array.flatten()  # Flatten to 1D
    
    # Save flattened image as .npy file
    save_path = os.path.join(output_folder, f"flattened_{idx+1}.npy")
    np.save(save_path, img_flattened)
    print(f"Saved: {save_path}")

print("✅ All 100 flattened images saved successfully!")
