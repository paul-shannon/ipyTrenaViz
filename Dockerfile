FROM jupyter/scipy-notebook
USER root
RUN apt-get update
RUN apt-get install git -y
RUN apt-get install nodejs -y
RUN npm install -g webpack -y
ADD . /home/jovyan/ipyTrenaViz
WORKDIR /home/jovyan/ipyTrenaViz
RUN chown -R jovyan:users /home/jovyan/ipyTrenaViz
USER jovyan
RUN pip install ipywidgets
RUN jupyter nbextension enable --py widgetsnbextension
RUN (cd ./js; npm update)
RUN (cd ./js; webpack --config webpack.config.js)
RUN pip install -e .
RUN (cd ./js; npm install)
RUN jupyter nbextension install --user --py ipyTrenaViz
RUN jupyter nbextension enable --user --py --sys-prefix ipyTrenaViz

