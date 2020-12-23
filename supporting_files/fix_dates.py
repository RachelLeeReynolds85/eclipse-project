import pandas as pd
import json


years = pd.read_csv("supporting_files/eclipse_dates_1800-2020.csv").dates_path.tolist()

with open("eclipse_data.json") as file:
    data = json.load(file)
    data_dict = json.loads(data)

print(type(data_dict[0]))

one_eclipse = data_dict[0]
one_eclipse["date"] = "new_date"
print(one_eclipse["date"])
print(len(data_dict))
print(len(years))

for i in range(0,38):
    data_dict[i]["date"] = str(years[i])

print(type(data_dict))

eclipse_json = json.dumps(data_dict)
with open("supporting_files/eclipse_data_corrected.txt", "w+") as file:
    json.dump(eclipse_json, file)


