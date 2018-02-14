import ipywidgets as widgets
from traitlets import Int, Unicode, Tuple, CInt, Dict, validate, observe
from datetime import datetime
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


    #----------------------------------------------------------------------------------------------------
    def writeToTab(self, tabNumber, msg):
       payload = {"tabNumber": tabNumber, "msg": msg};
       self.msgFromKernel = json.dumps({"cmd": "writeToTab", "status": "request", "callback": "", "payload": payload})

    #----------------------------------------------------------------------------------------------------
    # messages are only transmitted to the browser when it changes; duplicate messages are simply ignored.
    # this next method ensures that any ensuing message is seen as novel in the browser
    def _resetMessage(self):
       self.msgFromKernel = json.dumps({"cmd": "cleanSlate", "status": "nop", "callback": "", "payload": ""});

    #----------------------------------------------------------------------------------------------------
    def raiseTab(self, tabName):
       self.msgFromKernel = json.dumps({"cmd": "raiseTab", "status": "request", "callback": "", "payload": tabName})

    #----------------------------------------------------------------------------------------------------
    def setWidgetHeight(self, newHeightInPixels):

       self.msgFromKernel = json.dumps({"cmd": "setWidgetHeight", "status": "request", "callback": "",
                                        "payload": newHeightInPixels})

    #----------------------------------------------------------------------------------------------------
    def getBrowserState(self):
        return(json.loads(self._browserState));

    #----------------------------------------------------------------------------------------------------
    def getRequestCount(self):
        return(self.getBrowserState()["requestCount"])

    #----------------------------------------------------------------------------------------------------
    def displayGraphFromFile(self, filename, modelNames):
       payload = {"filename": filename, "modelNames": modelNames}
       self.msgFromKernel = json.dumps({"cmd": "displayGraphFromFile", "status": "request", "callback": "", "payload": payload})

    #----------------------------------------------------------------------------------------------------
    def setStyle(self, filename):
       payload = filename
       self.msgFromKernel = json.dumps({"cmd": "setStyle", "status": "request", "callback": "", "payload": payload})

    #----------------------------------------------------------------------------------------------------
    def setGenome(self, genomeName):
       supportedGenomes = ["hg19", "hg38", "mm10"];
       if(genomeName in supportedGenomes):
          self.msgFromKernel = json.dumps({"cmd": "setGenome", "status": "request", "callback": "", "payload": genomeName})
       else:
          return("only %s genomes currently supported" % supportedGenomes)

    #----------------------------------------------------------------------------------------------------
    def showPDB(self, pdbID):
       self.msgFromKernel = json.dumps({"cmd": "showPDB", "status": "request", "callback": "", "payload": pdbID})

    #----------------------------------------------------------------------------------------------------
    def showGenomicRegion(self, regionString):
       self._resetMessage();
       self.msgFromKernel = json.dumps({"cmd": "showGenomicRegion", "status": "request", "callback": "", "payload": regionString})

    #----------------------------------------------------------------------------------------------------
    def addBedTrackFromDataFrame(self, tbl, trackName, trackMode, color, trackHeight=200):
       self._resetMessage();
       supportedTrackModes = ["EXPANDED", "COLLAPSED", "SQUISHED"];

       if(not trackMode.upper() in supportedTrackModes):
         return("trackMode %s not in %s (case unimportant)" % (trackMode, supportedTrackModes))

       tempFileName = "tbl%d.tsv" % datetime.now().microsecond
       tbl.to_csv(tempFileName, sep="\t", header=False, index=False)
       payload = {"trackName": trackName,
                  "bedFileName": tempFileName,
                  "displayMode": trackMode.upper(),
                  "color": color,
                  "trackHeight": trackHeight}
       self.msgFromKernel = json.dumps({"cmd": "addBedTrackFromDataFrame", "status": "request",
                                        "callback": "", "payload": payload})

    #----------------------------------------------------------------------------------------------------
    def removeTracksByName(self, trackNames):
       self._resetMessage();
       payload = trackNames
       self.msgFromKernel = json.dumps({"cmd": "removeTracksByName", "status": "request",
                                        "callback": "", "payload": payload})


