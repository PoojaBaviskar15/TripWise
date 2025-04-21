import requests
from transformers import pipeline
from textblob import TextBlob
from opencage.geocoder import OpenCageGeocode
import logging
import time
import supabase
from supabase import create_client, Client


# ---------- INIT ----------
# Set up Supabase and OpenCage API keys
SUPABASE_URL = "https://uudxfceikduzsjgmhuaj.supabase.co"  # Example: https://xyzcompany.supabase.co
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZHhmY2Vpa2R1enNqZ21odWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTc0NzMsImV4cCI6MjA1Nzc5MzQ3M30.PwZWCr1pyQXkPxXB6zQYcJt_pZEWo2T0YsD1BjCqpkY"
OPENCAGE_API_KEY = "4f661ab8f6cf482f8748f76c3870d77a"


supabase = create_client(SUPABASE_URL, SUPABASE_API_KEY)
geocoder = OpenCageGeocode(OPENCAGE_API_KEY)
ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

# ---------- HELPERS ----------

def extract_places(text):
    entities = ner(text)
    places = set()
    for ent in entities:
        if ent['entity_group'] == 'LOC':
            places.add(ent['word'].strip())
    return list(places)

def get_coordinates(place_name):
    try:
        results = geocoder.geocode(place_name)
        if results and len(results) > 0:
            lat = results[0]['geometry']['lat']
            lng = results[0]['geometry']['lng']
            return lat, lng
    except Exception as e:
        logging.error(f"Error geocoding '{place_name}': {e}")
    return None, None

def get_sentiment(text):
    return TextBlob(text).sentiment.polarity  # Range: -1 to 1

def clean_place_name(name):
    return name.replace("##", "").strip()

# Function to check if place name is valid (length filter)
def is_valid_place_name(name):
    return len(name) >= 3 

def get_popularity_score(blog_id):
    url = f"{SUPABASE_URL}/rest/v1/blog_reviews"
    params = {"blog_id": f"eq.{blog_id}"}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        logging.error(f"Failed to fetch reviews for blog {blog_id}")
        return 0

    reviews = response.json()
    if not reviews:
        return 0

    score = 0
    sentiment_score = 0
    total_reviews = len(reviews)

    for review in reviews:
        sentiment_score += get_sentiment(review.get('text', ''))
        score += review.get('rating', 0)

    avg_rating = score / total_reviews
    avg_sentiment = sentiment_score / total_reviews

    return avg_rating * 0.6 + avg_sentiment * 0.4

def save_to_supabase(place, lat, long, popularity_score, blog_id):
    url = f"{SUPABASE_URL}/rest/v1/popular_places"
    data = {
        "name": place,
        "lat": lat,
        "long": long,
        "popularity_score": popularity_score,
        "blog_ids": [blog_id],
        "review_ids": [],
        "category_guess": "Unknown",
        "added_at": "now()"
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        logging.info(f"✅ Saved {place} to popular_places.")
    else:
        logging.error(f"❌ Error saving {place}: {response.status_code}, {response.text}")


# ---------- MAIN ----------

def main():
    # Fetch blogs from Supabase
    blogs = supabase.table('blogs').select('*').execute()
    blogs = blogs.data

    for blog in blogs:
        blog_id = blog['id']
        blog_text = blog.get('content', '')

        logging.info(f"\n📖 Processing blog ID {blog_id}...")
        places = extract_places(blog_text)

        for place in places:
            place = clean_place_name(place)
            if is_valid_place_name(place):
                logging.info(f"📍 Found place: {place}")
                lat, long = get_coordinates(place)
                if lat and long:
                    popularity_score = get_popularity_score(blog_id)
                    save_to_supabase(place, lat, long, popularity_score, blog_id)
                else:
                    logging.warning(f"⚠️ Could not find coordinates for '{place}'")
            else:
                logging.warning(f"⚠️ Invalid place name detected: {place}. Skipping.")
            
            time.sleep(1)  # Avoid rate limits

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
