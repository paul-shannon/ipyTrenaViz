import ipywidgets as widgets
from traitlets import Int, Unicode, Tuple, CInt, Dict, validate, observe
import json

@widgets.register
class ipyTrenaViz(widgets.DOMWidget):
    _view_name = Unicode('ipyTrenaVizView').tag(sync=True)
    _model_name = Unicode('ipyTrenaVizModel').tag(sync=True)
    _view_module = Unicode('ipyTrenaViz').tag(sync=True)
    _model_module = Unicode('ipyTrenaViz').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    msgFromKernel = Unicode("").tag(sync=True)
    _browserState = Unicode("").tag(sync=True)


    def writeToTab(self, tabNumber, msg):
       payload = {"tabNumber": tabNumber, "msg": msg};
       self.msgFromKernel = json.dumps({"cmd": "writeToTab", "status": "request", "callback": "", "payload": payload})

    def raiseTab(self, tabName):
       self.msgFromKernel = json.dumps({"cmd": "raiseTab", "status": "request", "callback": "", "payload": tabName})

    def getBrowserState(self):
        return(json.loads(self._browserState));

    def getRequestCount(self):
        return(self.getBrowserState()["requestCount"])

    def displayGraph(self):
       #payload = {"tabNumber": tabNumber, "msg": msg};
       self.msgFromKernel = json.dumps({"cmd": "displayGraph", "status": "request", "callback": "", "payload": ""})

    def setGenome(self):
       self.msgFromKernel = json.dumps({"cmd": "setGenome", "status": "request", "callback": "", "payload": "hg38"})

    def showPDB(self, pdbID):
       self.msgFromKernel = json.dumps({"cmd": "showPDB", "status": "request", "callback": "", "payload": pdbID})

    def showGenomicRegion(self, regionString):
       self.msgFromKernel = json.dumps({"cmd": "showGenomicRegion", "status": "request", "callback": "", "payload": regionString})

