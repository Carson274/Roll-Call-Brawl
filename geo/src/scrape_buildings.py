import os
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
from bs4 import BeautifulSoup  # For HTML parsing

# Load environment variables from .env file
load_dotenv()

USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

if not USERNAME or not PASSWORD:
    print("Please set your USERNAME and PASSWORD in your .env file.")
    exit()

# Configure Chrome options (headless mode is off so you can manually log in)
chrome_options = Options()
# Disable headless mode for manual login
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# Initialize the Chrome WebDriver using Service
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Open the login page
    driver.get("https://login.oregonstate.edu/cas/login?service=https://my.facilities.oregonstate.edu")
    
    print("A browser window has opened. Please complete the login process manually (including any MFA).")
    print("Once you are logged in and see the facilities page, return to this terminal and press Enter to continue...")
    input("Press Enter to continue...")

    # Now navigate to the JSON endpoint (update the timestamp if needed)
    driver.get("https://my.facilities.oregonstate.edu/facilities/jsonGetByBuilding?_=1743916646051782")
    
    # Wait for a while to allow the JSON data to load
    time.sleep(20)
    
    page_source = driver.page_source.strip()
    print("Page source content (first 1000 characters):")
    print(page_source[:1000])
    
    # Use BeautifulSoup to extract the text inside the <body> tag
    soup = BeautifulSoup(page_source, 'html.parser')
    body_text = soup.body.get_text(strip=True)
    
    # Attempt to parse the extracted text as JSON
    try:
        data = json.loads(body_text)
        # Save the JSON data to a file
        with open("building_data.json", "w") as f:
            json.dump(data, f, indent=4)
        print("Building data saved to building_data.json")
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        print("Extracted body text:")
        print(body_text)
        
finally:
    driver.quit()
