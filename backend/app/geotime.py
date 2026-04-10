import math
from datetime import datetime

def calculate_plausibility(lost_data, found_data):
    """
    Returns a score from 0 to 1 based on spatial and temporal logic.
    1.0 = Highly Plausible, 0.0 = Impossible.
    """
    
    # --- 1. Temporal Logic ---
    # Convert ISO strings to datetime objects
    lost_time = lost_data.get('createdAt').replace(tzinfo=None)
    found_time = found_data.get('createdAt').replace(tzinfo=None)
    
    # If it was found BEFORE it was lost, it's highly suspicious (score 0.1)
    if found_time < lost_time:
        time_score = 0.1
    else:
        # If found within 48 hours, high score. After 1 week, lower score.
        time_diff = (found_time - lost_time).total_seconds() / 3600 # hours
        if time_diff < 48:
            time_score = 1.0
        elif time_diff < 168: # 1 week
            time_score = 0.7
        else:
            time_score = 0.4

    # --- 2. Spatial Logic (City/Location Matching) ---
    lost_loc = lost_data.get('location', '').lower()
    found_loc = found_data.get('location', '').lower()
    
    # Simple semantic location matching
    # If they share a common word (e.g., 'Library', 'Canteen'), high score
    common_words = set(lost_loc.split()) & set(found_loc.split())
    if len(common_words) > 0:
        spatial_score = 1.0
    else:
        spatial_score = 0.5 # Possible, but not a direct location match

    # Weighted Average: Time (40%) + Location (60%)
    final_plausibility = (time_score * 0.4) + (spatial_score * 0.6)
    
    return round(final_plausibility * 100) # Return as percentage