# fullstack-proj

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

- Start server with command
    - `poetry run python app.py`
