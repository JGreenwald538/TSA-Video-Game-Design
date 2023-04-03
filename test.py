from PIL import Image

# Load the image
img = Image.open("Assets/Background/thumbnail_pixel.shooter.tsa.png")

# Create a new image to store the rotated copies
rotated_imgs = []

# Rotate the image 60 times
for i in range(0, -30, -1):
    rotated_img = img.copy()
    rotated_img = rotated_img.rotate(i, expand=True)
    rotated_imgs.append(rotated_img)

# Save the rotated images
for i, rotated_img in enumerate(rotated_imgs):
    rotated_img.save(f"Assets/Background/thumbnail_pixel.shooter.tsa{i*-1}.png")