import os
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
import requests
import pandas as pd
import json
import re
from gazpacho import Soup

# Use selenium to grab html on site (after waiting for site to fully load)
def get_html(url, wait):
    print("\nStarting headless Firefox driver!")
    print(f"Navigating to {url}")
    print(f"Waiting {wait} seconds...\n")
    options = Options()
    options.headless = True
    driver = webdriver.Firefox(options=options)
    driver.get(url)
    driver.implicitly_wait(wait)
    html = driver.page_source
    driver.close()
    return html

def scrape():

    eclipse_list = []

    years = pd.read_csv("supporting_files/eclipse_dates_1800-2020.csv").dates_path.tolist()
    
    for year in years:

        print("""
        # ========================
        # ECLIPSE PATH SCRAPE
        # ========================
        """)

        # URL of page to be scraped
        nasa_url = "https://eclipse.gsfc.nasa.gov/SEsearch/SEsearchmap.php?Ecl="
        eclipse_url = nasa_url + str(year)

        # Call selenium function to scrape url
        eclipse_html = get_html(eclipse_url, wait=7)

        # # Write scraped html to file
        # with open('supporting_files/eclipse_html_dump.html', 'w+', encoding='utf-8') as f:
        #     f.write(eclipse_html)

        # # Open html file and create gazpacho soup object
        # with open ("supporting_files/eclipse_html_dump.html", "r", encoding='utf-8') as f:
        #     contents = f.read()
        #     soup = Soup(contents)

        soup = Soup(eclipse_html)
        script = soup.find("script")[3].text
        # print(type(script))
        # print(script)
        
        umbra_tracks = script.split("Umbra track")[1]
        # print(umbra_tracks)

        messy_lines = re.split('\[|\]', umbra_tracks)

        eclipse_dict = {
            "date": str(year),
            "northern_limit": {
                "lats": [],
                "lons": [],
            },
            "central_line": {
                "lats": [],
                "lons": [],
            },
            "southern_limit": {
                "lats": [],
                "lons": [],
            },
            "left_line": {
                "lats": [],
                "lons": [],
            },
            "right_line": {
                "lats": [],
                "lons": [],
            },
        }

        track_lookup = {
            1: "northern_limit",
            3: "central_line",
            5: "southern_limit",
            7: "left_line",
            9: "right_line",
        }

        # only use odd numbered messy_lines
        for i in [1, 3, 5, 7, 9]:
            messy_line = messy_lines[i]
            messy_line += ","
            messy_coords_spaces = re.split('new GLatLng|,\n', messy_line)
            messy_coords = []
            for coord in messy_coords_spaces:
                if coord != '\n' and coord != '':
                    messy_coords.append(coord)
            # print(messy_coords)
            lats = []
            lons = []
            for coord in messy_coords:
                split_coord = coord.split(", ")
                # print(split_coord)
                lat = float(split_coord[0][2:].strip())
                lats.append(lat)
                lon = float(split_coord[1][:-1].strip(')').strip())
                lons.append(lon)
            # print(lats)
            # print(lons)
            track_name = track_lookup[i]
            eclipse_dict[track_name]["lats"] = lats
            eclipse_dict[track_name]["lons"] = lons
        print(eclipse_dict)

        eclipse_list.append(eclipse_dict)
        eclipse_json = json.dumps(eclipse_list)
        with open("eclipse_data.txt", "w+") as file:
            json.dump(eclipse_json, file)
    
    
    

    # print("""
    # # ------------------------
    # # mongo insert...
    # """)

    # db.scrapes.drop()
    # db.scrapes.insert_one(mars_dictionary)

    # print("""
    # # successful!
    # # ------------------------
    # """)

    # return mars_dictionary
    return


# def get_mongo_dict():

#     print("""
#     # ========================
#     # MONGO QUERY
#     # ========================
#     """)

#     mongo_dict = db.scrapes.find_one()

#     print(type(mongo_dict))
#     for key, value in mongo_dict.items():
#         print(key)
#         print(value)
    
#     return mongo_dict

scrape()