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
	(cd ./examples/basicDemo; jupyter notebook --NotebookApp.token= simple.ipynb)


image:
	docker build -t ipytrenaviz .
