var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var cytoscape = require('cytoscape');
var igv = require('igv')
require('igv/igv.css')

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

   createDiv: function(){
      var self = this;
      var tabsOuterDiv = $("<div id='tabsOuterDiv' style='border:1px solid blue; height: 800px; width: 100%'></div>");
      var tabsList = $("<ul></ul>");
      tabsList.append("<li><a href='#igvTab'>igv</a></li>");
      tabsList.append("<li><a href='#cyjsTab'>cyjs</a></li>")

      var cyjsTab = $("<div id='cyjsTab'></div>");
      var cyjsDiv = $("<div id='cyjsDiv' style='border:1px solid green; height: 720px; width: 100%'></div>");
      cyjsTab.append(cyjsDiv);

      var igvTab = $("<div id='igvTab'></div>");
      var igvDiv = $("<div id='igvDiv' style='border:1px solid blue; height: 720px; width: 100%'></div>");
      igvTab.append(igvDiv);

      tabsOuterDiv.append(tabsList);
      tabsOuterDiv.append(igvTab);
      tabsOuterDiv.append(cyjsTab);
      return(tabsOuterDiv);
      },

   //--------------------------------------------------------------------------------
    createCyjs: function(){
        var options = {container: $("#cyjsDiv"),
                       elements: {nodes: [{data: {id:'a'}}],
				  edges: [{data:{source:'a', target:'a'}}]},
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
    updateStateToKernel: function(self, state){

        var jsonString = JSON.stringify(state);
        self.model.set("_browserState", jsonString);
        self.touch();
        },

    //--------------------------------------------------------------------------------
    dispatchRequest: function(){

       console.log(" === entering dispatchRequest, this is ");
       console.log(this);
       console.log("dispatchRequest, count: " + this._requestCount);
       this.updateStateToKernel(this, {requestCount: this._requestCount});

       this._requestCount += 1;
       window.requestCount = this._requestCount;

       var msgRaw = this.model.get("msgFromKernel");
       var msg = JSON.parse(msgRaw);
       console.log(msg);
       console.log("========================");
       switch(msg.cmd){
          case "writeToTab":
             this.writeToTab(msg);
             break;
          case "raiseTab":
              this.raiseTab(msg);
              break;
          case "setGenome":
              this.setGenome(msg);
              break;
          case "displayGraph":
              this.displayGraph(msg);
              break;
          case "showGenomicRegion":
              this.showGenomicRegion(msg);
              break;
          case "addBedTrackFromDataFrame":
	      this.addBedTrackFromDataFrame(msg);
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

       var igvOptions = hg38_options;
       var igvBrowser = igv.createBrowser($("#igvDiv"), igvOptions);
       var self = this;
       igvBrowser.on('locuschange',
            function(referenceFrame, chromLocString){
               self.updateStateToKernel(self, {"chromLocString": chromLocString});
               });
       window.igvpshannon = igvBrowser  // for debugging
       return(igvBrowser)
       },

     //--------------------------------------------------------------------------------
     setGenome: function(msg){
       $('a[href="#igvTab"]').click();
        var self = this;
        setTimeout(function(){
	    self.igvBrowser = self.initializeIGV("hg38");},0);
        }, // setGenome

     //--------------------------------------------------------------------------------
     showGenomicRegion: function(msg){

       $('a[href="#igvTab"]').click();
        var self = this;
        var locString = msg.payload;
        console.log("about to showGenomicRegion: '" + locString + "'");
        //setTimeout(function(){
	 self.igvBrowser.search(locString);
        //},0);
        }, // showGenomicRegion

     //--------------------------------------------------------------------------------
     addBedTrackFromDataFrame: function(msg){

        console.log("ipyTrenaViz/ipytrenaviz.js, addBedTrackFromDataFrame");
        var self = this;
        console.log("--- self:");
	console.log(self)
	console.log("--- self.igvBrowser:");
	console.log(self.igvBrowser)
        //var trackName = msg.payload.name;
        //var bedFileName = msg.payload.bedFileName;
        var trackName = "foo";
        var bedFileName = "tmp.bed";
        //var displayMode = msg.payload.displayMode;
        var displayMode = "EXPANDED"
        //var color = msg.payload.color;
        var color = "red";

        var href = window.location.href;
	var border = href.indexOf("/notebooks");
	var url = href.substring(0, border) + "/edit/" + bedFileName;
        //var url = window.location.href + "?" + bedFileName;
	//var url = "http://localhost:8871/edit/shared/tbl.bed";
        // this full url works with jupy: "http://localhost:9999/tree/shared/tmp.bed"
        // note use of "tree" - not edit, not terminal, not notebooks
        url = msg.payload.url
        var config = {format: "bed",
                      name: trackName,
                      url: url,
                      indexed: false,
                      displayMode: displayMode,
                      sourceType: "file",
                      color: color,
                      type: "annotation"};
         console.log(config);
         console.log(JSON.stringify(config))
         window.loadTrackResult = self.igvBrowser.loadTrack(config);
	 console.log("---- result of loadTrack:");
	 console.log(window.loadTrackResult);
	 console.log("after self.igvBrowser.loadTrack");
         }, // addBedTrackFromDataFrame

     //--------------------------------------------------------------------------------
     displayGraph: function(msg){
       $('a[href="#cyjsTab"]').click();
        var self = this;
        self.cyjs = self.createCyjs();
        setTimeout(function(){self.cyjs.fit(100);}, 500);

        }, // displayGraph


     //--------------------------------------------------------------------------------
   }); // ipyTrenaVizView


module.exports = {
  ipyTrenaVizModel : ipyTrenaVizModel,
  ipyTrenaVizView : ipyTrenaVizView
  };
