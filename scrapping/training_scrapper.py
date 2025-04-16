import requests
from bs4 import BeautifulSoup
from workout import Workout

url = "https://whatsonzwift.com/workouts/build-me-up#week-0-prep"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

section = soup.find('section')

articles = section.find_all('article')

# Each article is week + workout name : week-1-red-unicorn
article_ids = [article.get('id') for article in articles]

for article_id in article_ids:
    article = soup.find('article', id=article_id)

    container = article.find('div', class_='row workoutcontainer')

    workout_lists = container.find_all('div', class_='one-third column workoutlist')

    # Print contents (or do whatever you need)
    for w in workout_lists:
        print('article id : ', article_id)
        print('\n')
        print(w.text)
        print('\n')

print(f"Workout length : {len(article_ids)}")

workout = Workout("""10min from 25 to 75% FTP30sec @ 95rpm, 95% FTP30sec @ 85rpm, 50% FTP30sec @ 105rpm, 105% FTP30sec @ 85rpm, 50% FTP30sec @ 115rpm, 115% FTP30sec @ 85rpm, 50% FTP2min @ 85rpm, 50% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP1min from 115 to 140% FTP1min @ 85rpm, 50% FTP2min @ 100rpm, 115% FTP3min @ 85rpm, 65% FTP3min from 65 to 25% FTPView watts Enter FTP""")
for step in workout.to_list():
    print(step)