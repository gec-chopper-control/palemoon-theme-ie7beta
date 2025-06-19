/*       声明。
//本功能由Fly_world 设计。
//用于对搜索栏的自定义
//myChangeSearchEngine是切换搜索引擎的panel
//myPopupAutoComplete当自动搜索完成时,自动弹出的panel.
//SearchComplete,自动搜索完成时关闭myChangeSearchEngine
//noFocus点击搜索图标时,不自动focus
//clickClose点击窗口的任意位置关闭myChangeSearchEngine
*/

var searchBar= document.getElementById('searchbar') ;
var mySearchBar = {
	myChangeSearchEngine : null ,
	myPopupAutoComplete : null ,
	SearchComplete : false ,
	noFocus : false ,
	searchBarClick : false,
	
	/*初始化执行*/

	getPanel :function(){
		if(!this.myChangeSearchEngine)	this.myChangeSearchEngine=document.getElementById('myChangeSearchEngine') ;
		if(!this.myPopupAutoComplete) this.myPopupAutoComplete=document.getElementById('myPopupAutoComplete') ;
	},
	
	/*设置宽度*/
	setPanelWidth : function(panel,isFullSize){
		panel.minWidth="" ;
		var searchBarWidth=searchBar.boxObject.width ;
		if(isFullSize ){
			panel.removeAttribute('width') ;
			panel.minWidth=searchBarWidth-2;
		}
		else panel.width=searchBarWidth-2;	
	},
	
	/*Panel打开时执行*/
	onPanelShow : function(panel){	
		var myEngineBox =document.getElementById(panel.getAttribute('engineBox'),panel ) ;	
		var engines = searchBar.engines;
		for (var i = 0; i < engines.length; i++) {
			var engineInfo = engines[i];
			r =  document.createElement('toolbarbutton');;
			r.setAttribute('class', 'mySearchEngineButton');
			r.setAttribute('tooltiptext',engineInfo.name );
			r.setAttribute('image', engineInfo.iconURI.spec);
			r.setAttribute('index',i) ;
			if(engines[i]==searchBar.currentEngine) r.setAttribute('checked',true) ;
			r.setAttribute('group','myEngineGroup') ;
			r.setAttribute('type','radio') ;				
			r.addEventListener('command', function(event) {
				var searchBar=document.getElementById('searchbar');
				searchBar.currentEngine = searchBar.engines[this.getAttribute('index')];
				this.setAttribute('checked',true);
				var textBox=searchBar._textbox ;
				if(textBox.value!="") textBox.mController.startSearch(textBox.value);
				event.stopPropagation()
			}, false); 
			myEngineBox.appendChild(r);
		}
		if(!this.noFocus){
			var textBox = searchBar.textbox;
			if(!textBox.focused) textBox.focus();
		}
		else this.noFocus=false ;
		
		//var container = searchBar._textbox;
		function checkClick(event) {
		   if(event.target.localName=='searchbar') mySearchBar.searchBarClick=true; 
		   else mySearchBar.searchBarClick=false;
		}
		window.addEventListener("mousedown", checkClick, true);
	},
	
	/*panel要关闭时*/
	onPanelHiding : function(aEvent){
		if(this.contextOpened) this.contextOpened=false;
		else if(this.searchBarClick){
			aEvent.preventDefault() ;
			this.searchBarClick=false; 
		}
	},
	
	/*Panel打开时执行*/	
	onPanelHide : function(panel){
		var myEngineBox =document.getElementById(panel.getAttribute('engineBox'),panel ) ;
		while(myEngineBox.firstChild) myEngineBox.removeChild(myEngineBox.firstChild);
		panel.width=0 ;
		panel.hidden= true ;
		window.removeEventListener("mousedown", function(){}, true);
		this.contextOpened=false;
	},
	
	/* 打开Panel */
	openPanel : function(isFullSize){
		this.getPanel();		
		var popup=mySearchBar.myChangeSearchEngine;
		if(!popup.mPopupOpen) {
			popup.hidden = false;
			document.popupNode = null;
			popup.popupBoxObject.setConsumeRollupEvent( Ci.nsIPopupBoxObject.ROLLUP_NO_CONSUME);				
			popup.openPopup(searchBar,'after_start',0,0,false,false);
		}
		this.setPanelWidth(popup,isFullSize) ;		
	},
	/*关闭Panel */
	closePanel : function(){
		var popup=mySearchBar.myChangeSearchEngine;
		if(popup) popup.hidePopup();
	},	

	/*搜索完成*/
	onSearchComplete : function(textBox){
		this.SearchComplete=true ;
		var myPanel=this.myChangeSearchEngine ;
		var autoPopup=this.myPopupAutoComplete;
		if(textBox.mController.matchCount == 0) this.openPanel() ;
		else this.closePanel() ;
		this.SearchComplete=false ;		
	},

	/*点击搜索栏*/
	onSearchBoxClick : function(aEvent){
		if(aEvent.button == 0 ) this.openPanel();
		else if(aEvent.button == 2 ){
			this.searchBarClick=false;
			this.closePanel();
		}
	},

	/*点击搜索图标*/
	SearchbarImageOpen : function(){
		var fullSize=true;
		this.noFocus=true ;
		var textBox = searchBar.textbox;
		if(textBox.focused) gBrowser.focus() ;		
		mySearchBar.openPanel(fullSize);
	},	
	
	/*执行搜索*/
	goSearch : function(aEvent) {
		var textBox = searchBar._textbox;
		var textValue = textBox.value;
		var where = "tab";
		if (textValue) {
			textBox._formHistSvc.addEntry(textBox.getAttribute("autocompletesearchparam"), textValue);
		}
		myTabBar.isNewTabCmd=true;
		searchBar.doSearch(textValue, where);
		myTabBar.isNewTabCmd=false;		
	},
	
	/*失去焦点*/
	onBlur:function(){
		mySearchBar.closePanel();
	},

	contextOpened:false,
	init: function() {
		me=this;
		function checkContextMenu(event){
			me.contextOpened=true;
		}
		var container = searchBar._textbox;
		container.addEventListener("contextmenu", checkContextMenu, true);
	}
}
mySearchBar.init();
