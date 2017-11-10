from ._version import version_info, __version__

from .ipyTrenaViz import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'ipyTrenaViz',
        'require': 'ipyTrenaViz/extension'
    }]
