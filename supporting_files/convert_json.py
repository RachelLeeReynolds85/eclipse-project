import pandas as pd
import json


with open("supporting_files/eclipse_data_corrected.txt") as file:
    data = json.load(file)
    data_dict = json.loads(data)

print(type(data_dict))

with open("supporting_files/eclipse_data_json.json", "w+") as file:
    json.dump(data_dict, file)

# eclipse_json = json.dumps(data_dict)
# with open("supporting_files/eclipse_data_corrected.txt", "w+") as file:
#     json.dump(eclipse_json, file)


