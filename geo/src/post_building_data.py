import requests
import json

# Configuration
ENDPOINT_URL = "🤫"
JSON_FILE = "buildings.json"  # Save your JSON data to this file

def load_buildings_data(file_path):
    """Load buildings data from JSON file"""
    with open(file_path, 'r') as file:
        return json.load(file)

def post_buildings_to_endpoint(buildings_data):
    """Post buildings data to the endpoint"""
    headers = {
        'Content-Type': 'application/json',
    }
    
    payload = {
        'buildings': buildings_data
    }
    
    try:
        response = requests.post(
            ENDPOINT_URL,
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()  # Raise exception for HTTP errors
        
        print("Successfully posted buildings!")
        print("Response:", response.json())
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Error posting buildings: {e}")
        if hasattr(e, 'response') and e.response:
            print("Response content:", e.response.text)
        return False

def main():
    # Load the buildings data
    try:
        buildings_data = load_buildings_data(JSON_FILE)
        print(f"Loaded {len(buildings_data)} buildings from {JSON_FILE}")
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        return
    
    # Post the data to the endpoint
    post_buildings_to_endpoint(buildings_data)

if __name__ == "__main__":
    main()