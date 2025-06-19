/*       ������
//��������Fly_world ��ơ�
//���ڶ����������Զ���
//myChangeSearchEngine���л����������panel
//myPopupAutoComplete���Զ��������ʱ,�Զ�������panel.
//SearchComplete,�Զ��������ʱ�ر�myChangeSearchEngine
//noFocus�������ͼ��ʱ,���Զ�focus
//clickClose������ڵ�����λ�ùر�myChangeSearchEngine
*/

var searchBar= document.getElementById('searchbar') ;
var mySearchBar = {
	myChangeSearchEngine : null ,
	myPopupAutoComplete : null ,
	SearchComplete : false ,
	noFocus : false ,
	searchBarClick : false,
	
	/*��ʼ��ִ��*/

	getPanel :function(){
		if(!this.myChangeSearchEngine)	this.myChangeSearchEngine=document.getElementById('myChangeSearchEngine') ;
		if(!this.myPopupAutoComplete) this.myPopupAutoComplete=document.getElementById('myPopupAutoComplete') ;
	},
	
	/*���ÿ��*/
	setPanelWidth : function(panel,isFullSize){
		panel.minWidth="" ;
		var searchBarWidth=searchBar.boxObject.width ;
		if(isFullSize ){
			panel.removeAttribute('width') ;
			panel.minWidth=searchBarWidth-2;
		}
		else panel.width=searchBarWidth-2;	
	},
	
	/*Panel��ʱִ��*/
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
	
	/*panelҪ�ر�ʱ*/
	onPanelHiding : function(aEvent){
		if(this.contextOpened) this.contextOpened=false;
		else if(this.searchBarClick){
			aEvent.preventDefault() ;
			this.searchBarClick=false; 
		}
	},
	
	/*Panel��ʱִ��*/	
	onPanelHide : function(panel){
		var myEngineBox =document.getElementById(panel.getAttribute('engineBox'),panel ) ;
		while(myEngineBox.firstChild) myEngineBox.removeChild(myEngineBox.firstChild);
		panel.width=0 ;
		panel.hidden= true ;
		window.removeEventListener("mousedown", function(){}, true);
		this.contextOpened=false;
	},
	
	/* ��Panel */
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
	/*�ر�Panel */
	closePanel : function(){
		var popup=mySearchBar.myChangeSearchEngine;
		if(popup) popup.hidePopup();
	},	

	/*�������*/
	onSearchComplete : function(textBox){
		this.SearchComplete=true ;
		var myPanel=this.myChangeSearchEngine ;
		var autoPopup=this.myPopupAutoComplete;
		if(textBox.mController.matchCount == 0) this.openPanel() ;
		else this.closePanel() ;
		this.SearchComplete=false ;		
	},

	/*���������*/
	onSearchBoxClick : function(aEvent){
		if(aEvent.button == 0 ) this.openPanel();
		else if(aEvent.button == 2 ){
			this.searchBarClick=false;
			this.closePanel();
		}
	},

	/*�������ͼ��*/
	SearchbarImageOpen : function(){
		var fullSize=true;
		this.noFocus=true ;
		var textBox = searchBar.textbox;
		if(textBox.focused) gBrowser.focus() ;		
		mySearchBar.openPanel(fullSize);
	},	
	
	/*ִ������*/
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
	
	/*ʧȥ����*/
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
