import csv

import pandas as pd
import numpy as np

# df_population = pd.read_csv('merged_population.csv')
# print(df_population.head())
# df_shooting = pd.read_csv('fatal-police-shootings-data.csv')
# df = pd.merge(df_population, df_shooting, on=['statecode'])
# df.to_csv('shootings_population.csv', index=False)
#
df = pd.read_csv('date_count_total.csv', sep=',', error_bad_lines=False, encoding='utf-8',quoting=csv.QUOTE_NONE )
# df1 = pd.read_csv('2019_state_statecode_race_count.csv', sep=',', error_bad_lines=False,quoting=csv.QUOTE_NONE)
# df = pd.read_csv('year_race_age_count.csv', sep=',', error_bad_lines=False, quoting=csv.QUOTE_NONE)
# bins = [0, 20, 40, 60, 100]
# labels = ["<=20 Years", "21-40 Years", "41-60 Years", "Over 60 Years"]
# df['binned'] = pd.cut(df['age'], bins=bins, labels=labels)
# print(df)
# result = pd.merge(df1,df2,how='inner',on=['state','race'])
# print(result.head(10))
# df = df[['year','date']]
# print(df)
# df= df.groupby(['year','date']).size()
# df = df.loc[df['year'] == 2019]
# values = {'race': 'O'}
# df.fillna(value=values,inplace=True)
# df = df[['year','race','age']]
# df = df.groupby(['year', 'race','age']).agg({'race':'count'})
# print(df.info())
# df = df.loc[df['year'] == 2019]
# print(df)
# df['date'] = pd.to_datetime(df.date)
# df['date'] = pd.to_datetime(df["date"].dt.strftime('%Y-%m-%d'))
# df = df.groupby('date').sum()values
# df_year_count = df_year_count.groupby(df.index.to_period('m')).cumsum().reset_index()
# print(df_year_count)          shootings_population.csv'
df.to_json("date_count_total.json")
