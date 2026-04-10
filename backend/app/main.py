import os
import requests
import json
import ollama
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore, initialize_app
from firebase_admin import auth as admin_auth
from .geotime import calculate_plausibility

# Import the CLIP matching logic from our other file
try:
    from .matcher import calculate_similarity
except ImportError:
    from matcher import calculate_similarity

# 1. Initialize FastAPI
app = FastAPI(title="Semantic Forensic Blind-Match Engine API")

# 2. Enable CORS so React (localhost:3000) can talk to Python (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Initialize Firebase Admin
# Make sure serviceAccountKey.json is in your /backend folder!
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)
db = firestore.client()

@app.get("/")
def read_root():
    return {"status": "Forensic Engine Online", "ai_guardian": "Ready"}

# --- PHASE 2: SEMANTIC MATCHING ENDPOINT ---

@app.get("/run-match/{lost_item_id}")
async def run_match_engine(lost_item_id: str):
    """
    Forensic Match Engine v2.0
    Combines CLIP Semantic AI (70%) with Spatio-Temporal Plausibility (30%)
    to prevent fraudulent claims and physical impossibilities.
    """
    try:
        # 1. Fetch Lost Item details from Firestore
        lost_ref = db.collection('lost_items').document(lost_item_id).get()
        if not lost_ref.exists:
            raise HTTPException(status_code=404, detail="Lost item report not found")
        
        lost_data = lost_ref.to_dict()
        description = lost_data.get('description', '')

        # 2. Query all unclaimed Found Items
        found_items_docs = db.collection('found_items').where('status', '==', 'unclaimed').stream()
        
        matches = []

        for doc in found_items_docs:
            found_data = doc.to_dict()
            image_url = found_data.get('image_url')

            if not image_url:
                continue

            # --- FORENSIC ANALYSIS CORE ---

            # A. AI Vision Analysis (CLIP)
            # Measures how well the text matches the pixels
            ai_similarity = calculate_similarity(description, image_url)

            # B. Spatio-Temporal Plausibility (Logic)
            # Measures if the time and place of the found item make sense
            plausibility_score = calculate_plausibility(lost_data, found_data)

            # C. Weighted Confidence Scoring
            # Formula: (AI * 0.7) + (Logic * 0.3)
            # We trust the AI more, but logic can "veto" or "boost" a match.
            combined_confidence = int((ai_similarity * 0.7) + (plausibility_score * 0.3))

            # 3. Filtering: Only include items with high forensic probability
            if combined_confidence > 25:
                matches.append({
                    "found_item_id": doc.id,
                    "confidence": combined_confidence,
                    "ai_score": ai_similarity,
                    "logic_score": plausibility_score,
                    "image_url": image_url,
                    "location": found_data.get('location', 'Unknown Location'),
                    "category": found_data.get('category', 'General'),
                    "found_at": found_data.get('createdAt')
                })

        # 4. Sort matches: Highest Forensic Confidence first
        sorted_matches = sorted(matches, key=lambda x: x['confidence'], reverse=True)

        return {
            "lost_item_id": lost_item_id, 
            "forensic_status": "ANALYSIS_COMPLETE",
            "matches": sorted_matches
        }

    except Exception as e:
        print(f"Engine Error: {e}")
        raise HTTPException(status_code=500, detail="Forensic Engine Analysis Failed")

# --- PHASE 3: OLLAMA AI GUARDIAN ENDPOINTS ---

@app.post("/guardian/generate-questions")
async def generate_questions(data: dict = Body(...)):
    """
    Uses Ollama Vision to look at a found item image and generate 
    3 specific challenge questions for the claimant.
    """
    image_url = data.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail="Image URL is required")

    try:
        # Download image for Ollama
        image_content = requests.get(image_url).content

        prompt = """
        You are a Forensic Security Guardian. Analyze this image of a found item.
        Generate 3 specific questions that ONLY the true owner would know.
        Avoid obvious questions. Ask about:
        1. Unique marks, scratches, or stickers.
        2. Brand names or specific labels.
        3. Color of specific parts (like the zipper or interior).
        
        Return the result ONLY as a JSON list of strings.
        Example: ["What color is the inner lining?", "Is there a brand name on the front?", "Describe the keychain attached."]
        """

        response = ollama.generate(
            model='llama3.2-vision', # Or 'llava'
            prompt=prompt,
            images=[image_content]
        )

        # Parse the response to ensure it's a list
        questions_text = response['response']
        # Note: In a production app, use regex to extract the JSON list from the string
        return {"questions": questions_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama Error: {str(e)}")

@app.post("/guardian/verify-answers")
async def verify_answers(data: dict = Body(...)):
    """
    Uses Ollama to compare user answers against the actual image.
    Returns a verification score.
    """
    image_url = data.get("image_url")
    user_answers = data.get("answers") # This would be a string of their answers

    try:
        image_content = requests.get(image_url).content
        
        prompt = f"""
        Analyze the image and these user answers: "{user_answers}"
        Does the image confirm these answers? 
        Rate the accuracy from 0 to 100.
        Return ONLY a JSON object: {{"score": 85, "reason": "Reason for score"}}
        """

        response = ollama.generate(
            model='llama3.2-vision',
            prompt=prompt,
            images=[image_content]
        )

        return {"result": response['response']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/get-contact/{item_id}")
async def get_contact(item_id: str):
    # 1. Fetch the item
    item = db.collection('found_items').document(item_id).get()
    if not item.exists:
        return {"error": "Item not found"}
    
    # 2. Get the finder's ID
    finder_id = item.to_dict().get('finderId')
    
    # 3. Get the user email using Firebase Admin SDK
    user = admin_auth.get_user(finder_id)
    return {"email": user.email}

# 4. Run the server (if this file is executed directly)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)