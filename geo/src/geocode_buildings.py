import json
import requests
import time

API_KEY = "AIzaSyDdMJA6H8RiJBPZb_j4uqJ51FgRi3taPT0"  # Example key
INPUT_FILE = "clean_building_data.json"
OUTPUT_FILE = "clean_building_data_with_coords.json"

def get_lat_lng(address):
    """
    Uses the Google Maps Geocoding API to get the latitude and longitude for a given address.
    Returns a tuple (lat, lng) or (None, None) if the geocoding fails.
    """
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": API_KEY
    }
    response = requests.get(base_url, params=params)
    data = response.json()
    
    if data["status"] == "OK":
        results = data.get("results", [])
        if results:
            location = results[0]["geometry"]["location"]
            return (location["lat"], location["lng"])
    return (None, None)

def main():
    # Load the cleaned building data
    with open(INPUT_FILE, "r") as f:
        buildings = json.load(f)
    
    # Enrich each building record with latitude and longitude
    for building in buildings:
        # Construct a full address from the available data
        full_address = f"{building.get('addr1', '')}, {building.get('city', '')}, {building.get('state', '')}"
        
        print(f"Geocoding address: {full_address}")
        lat, lng = get_lat_lng(full_address)
        
        building["location"] = [lat, lng]
        
        # Sleep a bit between requests to avoid hitting rate limits
        time.sleep(0.2)
    
    # Filter and remove all parts of address that are not needed
    cleaned_buildings = []
    for building in buildings:
        cleaned_building = {
            "name": building.get("building"),
            "location": building.get("location")
        }
        cleaned_buildings.append(cleaned_building)
    
    # Save the updated building data to a new JSON file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(cleaned_buildings, f, indent=4)
    
    print(f"Updated building data saved to '{OUTPUT_FILE}'")

if __name__ == "__main__":
    main()
