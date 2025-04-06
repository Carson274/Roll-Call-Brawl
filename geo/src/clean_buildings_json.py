import json

def filter_properties():
    # Load the original JSON data
    with open("building_data.json", 'r') as f:
        data = json.load(f)
    
    # Filter each item in the data array to keep only the specified properties
    filtered_data = []
    for item in data['data']:
        filtered_item = {
            'addr1': item.get('addr1'),
            'city': item.get('city'),
            'state': item.get('state'),
            'building': item.get('building')
        }
        filtered_data.append(filtered_item)
    
    # Create the output structure
    output = filtered_data
    
    # Save the filtered data to a new JSON file
    with open("clean_building_data.json", 'w') as f:
        json.dump(output, f, indent=2)

filter_properties()