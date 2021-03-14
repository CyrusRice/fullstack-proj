# fullstack-proj Winter 2021: Online Chess App with Python-Flask
  # By Vinodh Kotipalli and Cyrus Rice
- Link to deployed app on heroku 
    - https://onboardchess.herokuapp.com/
- List of references and tutorials used
    - https://pythonhow.com/source-code-simple-website-with-python-html-and-css/
    - https://pythonbasics.org/flask-mongodb/
    - http://docs.mongoengine.org/projects/flask-mongoengine/en/latest/
    - https://www.fullstackpython.com/websockets.html
    - https://blog.miguelgrinberg.com/post/easy-websockets-with-flask-and-gevent
    - https://codepen.io/ace-subido/pen/qELGdd


- Install poetry if you havn't already with below command
    - `curl -SSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python`

- configure poetry to create virtual environment in project path
    - `poetry config virtualenvs.in-project true`

- Install dependencies and create python virtual environment 
    - `poetry install`

- To use the already created python virtual environment 
    - `poetry env use python`

- Install MongoDB
    - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

- Start server with command(with poetry)
    - `poetry run python app.py`
- Alternatively install following packages in python using pip commands 
   - `pip install Flask`
   - `pip install pymongo`
   - `pip install Flask-SocketIO`
   - `pip install Flask-Login`   
   - `pip install Flask-Session`
   - `pip install gevent`
   - `pip install gevent-websocket`
   - `pip install pywebpush`   
   - `pip install Flask-Table`
   - `pip install Flask-Bcrypt`
   - `pip install bcrypt`
   - `pip install rope`   
   - `pip install gunicorn`
   - `pip install dnspython`
- Start server with command(without poetry)
    - `python app.py`
