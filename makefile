build:
	(cd ./js; npm update)
	(cd ./js; webpack --config webpack.config.js)
	pip install -e .
	jupyter nbextension install --user --py ipyTrenaViz
	jupyter nbextension enable --user --py --sys-prefix ipyTrenaViz

clean:
	- rm -rf js/node_modules/*
	- rm -rf js/dist/*
	- rm -rf ipyTrenaViz/static/*
	- rm -rf ipyTrenaViz/__pycache__


run:
	(cd ./examples/basicDemo; jupyter notebook --NotebookApp.token= tester.ipynb)

runHome:
	(cd ./examples/basicDemo; jupyter notebook --NotebookApp.token= )


image:
	docker build -t ipytrenaviz .
	docker tag ipytrenaviz pshannon/ipytrenaviz:v0.9.7

runDocker:
	(cd ./examples/basicDemo; docker run -it --name ipytrenaviz bash)

