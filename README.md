ipyTrenaViz
===============================

igv.js and cytoscape.js, in one jupyter notebook widget, presented in two jQuery tabs

Installation...
------------

...is complicated.

But to get started, these steps should get you most or all of the way:
  - Install anaconda, opting for Python >= 3.5 as your default version
  - conda install -c conda-forge ipywidgets
  -   conda update -c conda-forge jupyter
  - conda install -c conda-forge jupyterlab
  -  conda upgrade -c conda-forge notebook
  - jupyter --version   # 4.4.0
  - jupyter notebook --version  # 5.3.1
  - jupyter lab --version # 0.31.1
  - study the inlucded <b>makefile</b> and its <b>buildWidget</b> target
  - only the "docker tag" command is specific to my installation
  
The project directory structure and configuration files (for npm, webpack, jupyter lab) are also complicated.
Luckily, the ipywidget/jupyterLab team provides a template to get you started in creating a new widget from scratch.

https://github.com/jupyter-widgets/widget-cookiecutter
