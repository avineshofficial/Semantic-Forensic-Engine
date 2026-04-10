import torch
from PIL import Image
import requests
from io import BytesIO
from transformers import CLIPProcessor, CLIPModel

# Load the model (this will download ~600MB on first run)
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def calculate_similarity(text_description, image_url):
    try:
        # 1. Download the image from Firebase URL
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content))

        # 2. Process inputs
        inputs = processor(
            text=[text_description], 
            images=img, 
            return_tensors="pt", 
            padding=True
        )

        # 3. Get similarity score
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image  # this is the image-text similarity score
        probs = logits_per_image.softmax(dim=1) # normalize
        
        # Convert to percentage
        score = logits_per_image.detach().numpy()[0][0]
        # Scaling score to a readable 0-100 range
        final_score = min(max(int(score * 2), 0), 100) 
        
        return final_score
    except Exception as e:
        print(f"Error in matching: {e}")
        return 0