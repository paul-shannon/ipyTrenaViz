var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var cytoscape = require('cytoscape');

//--------------------------------------------------------------------------------
// configure igv where package.json says
//        "igv_js_npm": "github:paul-shannon/igv.js.npm"
//--------------------------------------------------------------------------------
var igv = require('igv.js.npm')
require('igv.js.npm/igv.css')
//--------------------------------------------------------------------------------
// configure igv where package.json says
//        "igv": "^0.1.1"
//--------------------------------------------------------------------------------
require('../css/ipytrenaviz.css')

//var igv = require('igv')
//require('igv/igv.css')

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
//----------------------------------------------------------------------------------------------------
var ipyTrenaVizModel = widgets.DOMWidgetModel.extend({

    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'ipyTrenaVizModel',
        _view_name : 'ipyTrenaVizView',
        _model_module : 'ipyTrenaViz',
        _view_module : 'ipyTrenaViz',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        msgFromKernel: "",
        })
   }); // ipyTrenaVizModel


var ipyTrenaVizView = widgets.DOMWidgetView.extend({

    _requestCount: 0,
    _browserState: {},

   createDiv: function(){
      var self = this;
      var tabsOuterDiv = $("<div id='tabsOuterDiv'></div>");
      var tabsList = $("<ul></ul>");
      tabsList.append("<li><a href='#igvTab'>igv</a></li>");
      tabsList.append("<li><a href='#cyjsTab'>cyjs</a></li>")

      var cyjsTab = $("<div id='cyjsTab'></div>");
      var cyjsDiv = $("<div id='cyjsDiv'></div>");
      var cyMenubarDiv = $("<div id='cyMenubarDiv'></div>");
      cyMenubarDiv.append($("<button id='cyFitButton' class='cyMenuButton'>Fit</button>"));
      cyMenubarDiv.append($("<button id='cyFitSelectedButton'class='cyMenuButton'>Fit Selected</button>"));
      cyMenubarDiv.append($("<button id='cySFNButton' class='cyMenuButton'>SFN</button>"));
      cyMenubarDiv.append($("<button id='cyHideUnselectedButton' class='cyMenuButton'>Hide Unselected</button>"));
      cyMenubarDiv.append($("<button id='cyShowAllButton' class='cyMenuButton'>Show All</button>"));
      cyMenubarDiv.append($("<button id='cyCycleThroughModelsButton' class='cyMenuButton'>Cycle Models</button>"));


      cyjsTab.append(cyMenubarDiv);
      cyjsTab.append(cyjsDiv);

      var igvTab = $("<div id='igvTab'></div>");
      var igvDiv = $("<div id='igvDiv'></div>");
      igvTab.append(igvDiv);

      tabsOuterDiv.append(tabsList);
      tabsOuterDiv.append(igvTab);
      tabsOuterDiv.append(cyjsTab);
      return(tabsOuterDiv);
      },

   //--------------------------------------------------------------------------------
    createCyjs: function(){
        var options = {container: $("#cyjsDiv"),
                       //elements: {nodes: [{data: {id:'a'}}],
		       //           edges: [{data:{source:'a', target:'a'}}]},
                       style: cytoscape.stylesheet()
                       .selector('node').style({'background-color': '#ddd',
						'label': 'data(id)',
						'text-valign': 'center',
						'text-halign': 'center',
						'border-width': 1})
                       .selector('node:selected').style({'overlay-opacity': 0.2,
							 'overlay-color': 'gray'})
                       .selector('edge').style({'line-color': 'black',
						'target-arrow-shape': 'triangle',
						'target-arrow-color': 'black',
						'curve-style': 'bezier'})
                       .selector('edge:selected').style({'overlay-opacity': 0.2,
							 'overlay-color': 'gray'})
                      };

	console.log("about to call cytoscape with options");
	var cy = cytoscape(options);
	console.log("after call to cytoscape");
	return(cy)
        },


   //--------------------------------------------------------------------------------
   render: function() {

      var self = this;
      this.$el.append(this.createDiv());
      setTimeout(function(){$("#tabsOuterDiv").tabs()}, 0);
      //setTimeout(function(){self.createCyjs();}, 1000)
      this.listenTo(this.model, 'change:msgFromKernel', this.dispatchRequest, this);
      },

    //--------------------------------------------------------------------------------
    configureCyjsMenuButtons: function(){

        var self = this;
        console.log("--- entering configureCyjsMenuButons");
	console.log(self.cyjs)

        $("#cyFitButton").unbind();
	$("#cyFitSelectedButton").unbind();
	$("#cySFNButton").unbind();
        $("#cyHideUnselectedButton").unbind();
        $("#cyShowAllButton").unbind();
        $("#cyCycleThroughModelsButton").unbind();

        $("#cyFitButton").click(function(){self.cyjs.fit(50)});
        $("#cyFitSelectedButton").click(function(){self.cyjs.fit(self.cyjs.nodes(":selected"), 50)});
        $("#cySFNButton").click(function(){
           var selectedNodes = self.cyjs.nodes(":selected");
	   console.log("   selected node count: " + selectedNodes.length);
	   var neighborhoodNodes = selectedNodes.neighborhood().nodes();
	   console.log("   neighborhood node count: " + neighborhoodNodes.length);
	   neighborhoodNodes.select()
	   var newSelectedNodes = self.cyjs.nodes(":selected");
	   console.log("    new selected node count: " + newSelectedNodes.length);
	   });
        $("#cyHideUnselectedButton").click(function(){self.cyjs.nodes(":unselected").hide()});
        $("#cyShowAllButton").click(function(){self.cyjs.nodes().show(); self.cyjs.edges().show()});

        $("#cyCycleThroughModelsButton").click(function(){
            var nextModelName = self.nextCyModelName(self);
            console.log("cycle through to " + nextModelName);
            self.displayCyModel(self, nextModelName);
            });
         },

    //--------------------------------------------------------------------------------
    nextCyModelName: function(self){

        console.log("--- nextCyModelName: ");
        console.log(self)

        var currentModelNameIndex = self.modelNames.indexOf(self.currentModelName)
        var nextModelNameIndex = currentModelNameIndex + 1;
        var lastIndex = self.modelNames.length - 1

        if(nextModelNameIndex > lastIndex){
           nextModelNameIndex = 0;
           }

        var modelName = self.modelNames[nextModelNameIndex]
        console.log(" next up is model name " + nextModelNameIndex + ": " + modelName);

        return(modelName)
        }, // nextCyModelName

      //----------------------------------------------------------------------------------------------------
      displayCyModel: function(self, modelName){

         console.log("--- displayCyModel: " + modelName);
         console.log(self)

           // make all nodes visible.  some may have been hidden in the previous view
         self.cyjs.nodes().show()
           // rfScore and pearsonCoeff are the current popular node attributes
           // for controlling size and color.  set them, for all TF nodes, to zero
         self.cyjs.nodes().filter(function(node){return node.data("type") == "TF"}).map(function(node){node.data({"rfScore": 0})})
         self.cyjs.nodes().filter(function(node){return node.data("type") == "TF"}).map(function(node){node.data({"pearsonCoeff": 0})})

            // transfer all <modelName>.rf_score to simply "rf_score"
         var noaName = modelName + "." + "rfScore";
         console.log("--- copying " + noaName + " values to rfSscore");
         self.cyjs.nodes("[type='TF']").map(function(node){node.data({"rfScore":  node.data(noaName)})})

         noaName = modelName + "." + "pearsonCoeff";
         console.log("--- copying " + noaName + " values to pearsonCoeff");
         self.cyjs.nodes("[type='TF']").map(function(node){node.data({"pearsonCoeff":       node.data(noaName)})})

           // now hide all the 0 randomForest TF nodes
         self.cyjs.nodes().filter(function(node){return(node.data("rfScore") == 0 && node.data("type") == "TF")}).hide()

           // transfer the "motifInModel" node attribute
         noaName = modelName + "." + "motifInModel";
         self.cyjs.nodes("[type='regulatoryRegion']").map(function(node){node.data({"motifInModel": node.data(noaName)})})

         self.cyjs.nodes().filter(function(node){return(node.data("motifInModel") == false &&
                                                       node.data("type") == "regulatoryRegion")}).hide()

         $("#cyModelSelector").val(modelName);
         self.currentModelName = modelName;

         }, // displayCyModel

    //--------------------------------------------------------------------------------
    updateStateToKernel: function(self, name, value){ // state){

        var self = this;
	self._browserState[name] = value;
        var jsonString = JSON.stringify(self._browserState)
        self.model.set("_browserState", jsonString);
        self.touch();
        },

    //--------------------------------------------------------------------------------
    dispatchRequest: function(){

       console.log(" === entering dispatchRequest, this is ");
       console.log(this);
       console.log("dispatchRequest, count: " + this._requestCount);
       var self = this;
       self.updateStateToKernel(this, "requestCount", self._requestCount)

       self._requestCount += 1;
       window.requestCount = self._requestCount;

       var msgRaw = self.model.get("msgFromKernel");
       var msg = JSON.parse(msgRaw);
       console.log(msg);
       console.log("========================");
       switch(msg.cmd){
          case "writeToTab":
             self.writeToTab(msg);
             break;
          case "raiseTab":
              self.raiseTab(msg);
              break;
          case "setWidgetHeight":
              $("#tabsOuterDiv").height(msg.payload);
	         // ascend the element hierarchy to find the first jupyter scrollable
                 // output div -- which class may change in time, but direct inspection
                 // shows today (10 jan 2018) is of class "output_scroll"
              $("#tabsOuterDiv").closest(".output_scroll").height(msg.payload)
              break;
          case "setGenome":
              self.setGenome(msg);
              break;
          case "displayGraphFromFile":
              self.displayGraphFromFile(msg);
              break;
          case "setStyle":
              self.setCyStyle(msg);
              break;
          case "showGenomicRegion":
              self.showGenomicRegion(msg);
              break;
          case "addBedTrackFromDataFrame":
	      self.addBedTrackFromDataFrame(msg);
	      break;
          case "cleanSlate":
              console.log("slate-cleaning msg received");
              break;
          default:
              alert("dispatchRequest: unrecognized msg.cmd: " + msg.cmd);
          } // switch
       }, // dispatchRequest

    //--------------------------------------------------------------------------------
     writeToTab: function(msg){
       var tabNumber = msg.payload.tabNumber;
       var newContent = msg.payload.msg;
       if(tabNumber == 1){
           $("#igvTab").text(newContent);
           }
        else if(tabNumber == 2){
           $("#cyjsTab").text(newContent);
           }
        }, // writeToTab

     //--------------------------------------------------------------------------------
     raiseTab: function(msg){

        var tabName = msg.payload
        switch(tabName){
           case("1"):
              $('a[href="#igvTab"]').click();
              break;
           case("2"):
              $('a[href="#cyjsTab"]').click();
              break;
           default:
              alert("raiseTab: no tab named " + tabName);
           }
        }, // writeToTab

     //--------------------------------------------------------------------------------
    initializeIGV: function(genomeName){

       console.log("==== ipytrenaviz.js.initializeIGV, geneomeName: " + genomeName)
       var self = this;

       var hg38_options = {
	    minimumBases: 5,
	    flanking: 2000,
	    showRuler: true,
	    reference: {id: "hg38",
                fastaURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa",
             cytobandURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/cytoBandIdeo.txt"
            },
	    tracks: [
                 {name: 'Gencode v24',
                  url: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/genes/gencode.v24.annotation.sorted.gtf.gz",
                  indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/genes/gencode.v24.annotation.sorted.gtf.gz.tbi",
                  type: 'annotation',
                  format: 'gtf',
                  visibilityWindow: 500000,
                  displayMode: 'EXPANDED',
                  color: 'black',
                  height: 300
                  },
	          ]
          }; // hg38_options

	var hg19_options = {
	    minimumBases: 5,
	    flanking: 2000,
	    showRuler: true,
	    reference: {id: "hg38"},
	    tracks: [
                 {name: 'Gencode v18',
                       url: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.collapsed.bed",
                  indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.collapsed.bed.idx",
                  visibilityWindow: 2000000,
                  displayMode: 'EXPANDED',
		  height: 300
                  },
	          ]
          }; // hg19_options


	var mm10_options = {
            flanking: 2000,
	    showKaryo: false,
            showNavigation: true,
            minimumBases: 5,
            showRuler: true,
            reference: {id: "mm10",
			fastaURL: "http://trena.systemsbiology.net/mm10/GRCm38.primary_assembly.genome.fa",
			cytobandURL: "http://trena.systemsbiology.net/mm10/cytoBand.txt"
                       },
            tracks: [
		{name: 'Gencode vM14',
		 url: "http://trena.systemsbiology.net/mm10/gencode.vM14.basic.annotation.sorted.gtf.gz",
		 indexURL: "http://trena.systemsbiology.net/mm10/gencode.vM14.basic.annotation.sorted.gtf.gz.tbi",
		 indexed: true,
		 type: 'annotation',
		 format: 'gtf',
		 visibilityWindow: 2000000,
		 displayMode: 'EXPANDED',
		 height: 300,
		 searchable: true
		},
            ]
	}; // mm10_options

        var igvOptions;

        console.log("=== genomeName: " + genomeName);

	switch(genomeName) {
	case "hg19":
            igvOptions = hg19_options;
            break;
	case "hg38":
            igvOptions = hg38_options;
            break;
	case "mm10":
            igvOptions = mm10_options;
            break;
        } // switch on genoneName

	// $("#igvDiv").children().remove();
	setTimeout(function(){
           console.log("=== about to create browser");
           console.log("igvOptions:");
           console.log(igvOptions);
	   self.igvBrowser = igv.createBrowser($("#igvDiv"), igvOptions);
           self.igvBrowser.on('locuschange',
              function(referenceFrame, chromLocString){
                 self.updateStateToKernel(self, "chromLocString", chromLocString)
                 });
            }, 0);

       window.igvpshannon = self.igvBrowser  // for debugging
       //return(self.igvBrowser)
       },

     //--------------------------------------------------------------------------------
     setGenome: function(msg){
       $('a[href="#igvTab"]').click();
        var self = this;
        var genomeName = msg.payload;
        console.log("~/github/ipyTrenaViz/js/lib/ipytrenaviz.js, setGenome: " + genomeName);
        setTimeout(function(){
           self.initializeIGV(genomeName);}, 1000);
        }, // setGenome

     //--------------------------------------------------------------------------------
     showGenomicRegion: function(msg){

        $('a[href="#igvTab"]').click();
        var self = this;
        var locString = msg.payload;
        console.log("about to showGenomicRegion: '" + locString + "'");
        self.igvBrowser.search(locString);
        }, // showGenomicRegion

     //--------------------------------------------------------------------------------
     addBedTrackFromDataFrame: function(msg){

        console.log("ipyTrenaViz/ipytrenaviz.js, addBedTrackFromDataFrame");
        var self = this;
        console.log("--- self:");
	console.log(self)
	console.log("--- self.igvBrowser:");
	console.log(self.igvBrowser)
        var trackName = msg.payload.trackName;
        var bedFileName = msg.payload.bedFileName;
        var displayMode = msg.payload.displayMode;
        var color = msg.payload.color;
        var trackHeight = msg.payload.trackHeight;

        var href = window.location.href;
	var border = href.indexOf("/notebooks");
	//var url = href.substring(0, border) + "/edit/" + bedFileName;
        //var url = window.location.href + "?" + bedFileName;
	//var url = "http://localhost:8871/edit/shared/tbl.bed";
        // befFileName is written into the current working directory
        // this may be ascertained by examining window.location.pathname
        // and extracting the zero-or-more subdirectories between
        // "/notebooks/subDir/tester.ipynb"
        // split("/"): ["", "notebooks", "subDir", "tester.ipynb"]
        var subDirs = ""
        var tokens = window.location.pathname.split("/")
        if(tokens.length > 3){
           subDirs = tokens.slice(2, tokens.length-1).join("/")
	   }
        var elements = []
	elements.push(window.location.origin);
	elements.push("files");
        console.log("=== subDirs: " + subDirs);
        if(subDirs != ""){
          elements.push(subDirs);
	  }
	elements.push(bedFileName)
	var url = elements.join("/")
        //var url = window.location.origin + "/files/" + bedFileName;
        console.log("=== constructing igv url from " + window.location.pathname)
        console.log("=== asking igv to load tract at " + url)
        // this full url works with jupy: "http://localhost:9999/tree/shared/tmp.bed"
        // note use of "tree" - not edit, not terminal, not notebooks
        //url = msg.payload.url
        var config = {format: "bed",
                      name: trackName,
                      url: url,
                      indexed: false,
                      displayMode: displayMode,
                      sourceType: "file",
                      color: color,
		      height: trackHeight,
                      type: "annotation"};
         console.log(config);
         console.log(JSON.stringify(config))
         console.log("=== about to loadTrack");
	 console.log("self.igvBrowser: ");
	 console.log(self.igvBrowser);
         window.loadTrackResult = self.igvBrowser.loadTrack(config);
	 console.log("---- result of loadTrack:");
	 console.log(window.loadTrackResult);
	 console.log("after self.igvBrowser.loadTrack");
         }, // addBedTrackFromDataFrame

     //--------------------------------------------------------------------------------
     readNetworkFromFile: function(filename, targetCy){
         //var s = window.location.href + "?" + filename;
	fetch(filename)
           .then(function(responseObj){
               console.log("fetch in action");
               return responseObj.json();
               })
           .then(function(j){
              targetCy.json(j);
              return "success";
              });

         return "SUCCESS";
         }, // readNetworkFromFile

     //----------------------------------------------------------------------------------------------------
     displayGraphFromFile: function(msg){

       $('a[href="#cyjsTab"]').click();
        var self = this;
        self.cyjs = self.createCyjs();
        window.cyjs = self.cyjs;
        self.configureCyjsMenuButtons()

        setTimeout(function(){self.cyjs.fit(100);}, 500);

        var filename = msg.payload.filename;
	var modelNames = msg.payload.modelNames

        $("#cyModelSelector").remove()  // delete the old menu

        if(typeof(modelNames) == "string")
           modelNames = [modelNames];
        if(modelNames.length > 1){
           self.createModelNamesMenu(self, modelNames);
           }
        self.modelNames = modelNames;  // make this an attribute of the trenaviz object
        self.currentModelName = modelNames[0];

        console.log("about to load file into cyjs: " + filename)
        console.log("     for modelNames[0]: " + modelNames[0]);
        self.readNetworkFromFile(filename, self.cyjs)
        setTimeout(function() {self.displayCyModel(self, modelNames[0]);}, 1000);
        }, // displayGraph

     //--------------------------------------------------------------------------------
     createModelNamesMenu: function(self, modelNames){

        if(typeof(modelNames) == "string"){
          modelNames = [modelNames];
          }

        if(modelNames.length < 1){
           return;
           }
        var html = "<select id='cyModelSelector' class='cyMenuButton'>"
        for(var i=0; i < modelNames.length; i++){
           html += "<option value='" + modelNames[i] + "'> " + modelNames[i]  + "</option>";
           } // for i
         html += "</select>"

         $("#cyMenubarDiv").append(html);
         $("#cyModelSelector").change(function(){
             var modelName =$(this).find("option:selected").val();
             self.displayCyModel(self, modelName);
             });

          setTimeout(function() {self.displayCyModel(self, modelNames[0])}, 0);

         }, // createModelNamesMenu

     //--------------------------------------------------------------------------------
     loadStyleFile: function(filename, cyTarget){

        console.log("ipytrenaviz.loadStyleFile, filename: " + filename);
        //var s = window.location.href + "?" + filename;
        console.log("=== about to getScript on " + filename);
        $.getScript(filename)
            .done(function(script, textStatus) {
            console.log(textStatus);
            //console.log("style elements " + layout.length);
            cyTarget.style(vizmap);
            })
        .fail(function( jqxhr, settings, exception ) {
            console.log("getScript error trying to read " + filename);
            console.log("exception: ");
            console.log(exception);
            });
       }, // loadStyle

     //--------------------------------------------------------------------------------
     setCyStyle: function(msg){

       var self = this;
        console.log("--- ipytrenaviz.js, setCyStyle, msg:");
        console.log(msg);
        $('a[href="#cyjsTab"]').click();
        var filename = msg.payload;
        self.loadStyleFile(filename, self.cyjs)
        }

   }); // ipyTrenaVizView


module.exports = {
  ipyTrenaVizModel : ipyTrenaVizModel,
  ipyTrenaVizView : ipyTrenaVizView
  };
