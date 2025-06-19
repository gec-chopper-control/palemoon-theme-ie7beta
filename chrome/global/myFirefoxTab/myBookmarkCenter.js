  var myBookMarkJs = {
	  myTabBookMarkMenu :null ,
	  myPlaceBookMarkMenu:null ,
	  isLoad : null,
	  myPanel : null,
	  myBookMarksTabs :null,
	  isFirstOpen:true,

	  initPanel : function(){
		  if(!this.isLoad){
			  try {
				setPanelSize.init();
				this.setTabCCC();
				this.isLoad=true;
			  }
			  catch(e){
				 this.isLoad=false;
			  }
		  }
	  },
	  
	  openPanel:function(Panel){
		  if(!this.myPanel) this.myPanel=Panel ;
		  this.initPanel() ;		  
		  setPanelSize.loadSize(Panel);
		  this.OpenBookMark(Panel);	
	  },

	  getBookmarkMenuButton : function(){
		this.myTabBookMarkMenu = document.getElementById('myTabBookmarks-Menu');
		this.myPlaceBookMarkMenu = document.getElementById('myPlaceBookmarksMenu');   
	  },
	  
	  setStartChecked :function(){
		this.myTabBookMarkMenu.setAttribute('checked', 'true');
		this.myPlaceBookMarkMenu.setAttribute('checked', 'true');		
	  },
	  
	  onPanelClose :function(CloseType){
		var myPanel=this.myPanel ;
		if(myPanel.state == "closed" || CloseType=="OpenSideBar"){
			this.myTabBookMarkMenu.setAttribute('checked', 'false');
			this.myPlaceBookMarkMenu.setAttribute('checked', 'false');		
			gBrowser.focus();
			this.isFocus=false ;			
		}
	  },
	  
	  OpenBookMark : function(myPanel){
		if(!this.myBookMarksTabs){
			this.myBookMarksTabs=document.getElementById('myBookMarksTabs',myPanel);
			this.myBookMarksTabs.selectedIndex=0 ;
		}
		var myTabs=this.myBookMarksTabs.selectedIndex;
		if(!this.isFirstOpen){
			if(myTabs==0) this.BookMarkFillData() ;
			else if(myTabs==1) this.HistoryFillData() ;
			this.isFirstOpen=false;
	  	}
		this.setStartChecked() ;
	  },
	  
	  BookMarkFillData : function(){
		var tree = document.getElementById('myBookmarks-view',this.myPanel);	
		tree.place ='place:queryType=1&folder=' + window.top.PlacesUIUtils.allBookmarksFolderId;
		var mySearchbox = document.getElementById('myBookmarkSearch-box',this.myPanel);	
		var aSearchString=mySearchbox.value	;
		if (!aSearchString) tree.place = tree.place;
		else
		tree.applyFilter(aSearchString,
			[PlacesUtils.bookmarksMenuFolderId,
			PlacesUtils.unfiledBookmarksFolderId,
			PlacesUtils.toolbarFolderId]);
	  },
	  
	  BookMarkSearch : function(aInput){
		var aSearchString=aInput.value ;        
		var tree = document.getElementById('myBookmarks-view',this.myPanel);
		if (!aSearchString) tree.place = tree.place;
		else
		tree.applyFilter(aSearchString,
			[PlacesUtils.bookmarksMenuFolderId,
			PlacesUtils.unfiledBookmarksFolderId,
			PlacesUtils.toolbarFolderId]); 		  
	 }, 
	  
	  HistoryFillData : function(){
		var gHistoryTree= document.getElementById('myHistoryTree',this.myPanel);;
		var gSearchBox= document.getElementById('search-box',this.myPanel);
		var gHistoryGrouping= document.getElementById('viewButton',this.myPanel).getAttribute('selectedsort1'); ;
		var gSearching = false;
		
		function HistorySidebarInit(){
			var bySite=document.getElementById('bysite',this.myPanel) ;
			var byVisited=document.getElementById('byvisited',this.myPanel);
			var byLastVisited=document.getElementById('bylastvisited',this.myPanel);
			var byDayAndSite=document.getElementById('bydayandsite',this.myPanel) ;
			var byDay=document.getElementById('byday',this.myPanel) ;
			if (gHistoryGrouping == 'site')	 bySite.setAttribute('checked', 'true');
			else if (gHistoryGrouping=='visited') byVisited.setAttribute('checked', 'true');
			else if (gHistoryGrouping == 'lastvisited') byLastVisited.setAttribute('checked', 'true');
			else if (gHistoryGrouping == 'dayandsite')	byDayAndSite.setAttribute('checked', 'true');
			else byDay.setAttribute('checked', 'true');			
		  	searchHistory(gSearchBox.value);				
		}
		
		function searchHistory(aInput)	{
		  var query = PlacesUtils.history.getNewQuery();
		  var options = PlacesUtils.history.getNewQueryOptions();
		
		  const NHQO = Ci.nsINavHistoryQueryOptions;
		  var sortingMode;
		  var resultType;

		  if (aInput) {
			query.searchTerms = aInput;
			sortingMode = NHQO.SORT_BY_TITLE_ASCENDING;
			resultType = NHQO.RESULTS_AS_URI;
		  }
		  else {
			switch (gHistoryGrouping) {
			  case 'visited':
				resultType = NHQO.RESULTS_AS_URI;
				sortingMode = NHQO.SORT_BY_VISITCOUNT_DESCENDING;
				break; 
			  case 'lastvisited':
				resultType = NHQO.RESULTS_AS_URI;
				sortingMode = NHQO.SORT_BY_DATE_DESCENDING;
				break; 
			  case 'dayandsite':
				resultType = NHQO.RESULTS_AS_DATE_SITE_QUERY;
				break;
			  case 'site':
				resultType = NHQO.RESULTS_AS_SITE_QUERY;
				sortingMode = NHQO.SORT_BY_TITLE_ASCENDING;
				break;
			  case 'day':
			  default:
				resultType = NHQO.RESULTS_AS_DATE_QUERY;
				break;
			}
		  }
		  options.sortingMode = sortingMode;
		  options.resultType = resultType;
		  gHistoryTree.load([query], options);
		}
		HistorySidebarInit();
	},
	
	 SU_handleTreeClick : function(aTree, aEvent, aGutterSelect) {
		if (aEvent.button == 2) return;
		var tbo = aTree.treeBoxObject;
		var row = { }, col = { }, obj = { };
		tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
		if (row.value == -1 || obj.value == 'twisty')
		  return;
		var mouseInGutter = false;
		if (aGutterSelect) {
		  var x = { }, y = { }, w = { }, h = { };
		  tbo.getCoordsForCellItem(row.value, col.value, 'image', x, y, w, h);
		  mouseInGutter = aEvent.clientX < x.value;
		}
		var modifKey = aEvent.ctrlKey || aEvent.shiftKey;
		var isContainer = tbo.view.isContainer(row.value);
		var openInTabs = isContainer &&
			 (aEvent.button == 1 ||
			  (aEvent.button == 0 && modifKey)) &&
			 PlacesUtils.hasChildURIs(tbo.view.nodeForTreeIndex(row.value));
		if (aEvent.button == 0 && isContainer && !openInTabs) {
			tbo.view.toggleOpenState(row.value);
			return;
		}
		else if (!mouseInGutter && openInTabs && aEvent.originalTarget.localName == 'treechildren') {
			tbo.view.selection.select(row.value);
			PlacesUIUtils.openContainerNodeInTabs(aTree.selectedNode, aEvent, { ownerWindow: window });
		}
		else if (!mouseInGutter && !isContainer && aEvent.originalTarget.localName == 'treechildren') {
			tbo.view.selection.select(row.value);
			PlacesUIUtils.openNodeWithEvent(aTree.selectedNode, aEvent, { ownerWindow: window });
			if(aEvent.button == 0)
				if (aTree.selectedNode && PlacesUtils.nodeIsURI(aTree.selectedNode)) this.myPanel.hidePopup() ;
		}
	},

	searchHistory :function searchHistory(aInput){
	  var query = PlacesUtils.history.getNewQuery();
	  var options = PlacesUtils.history.getNewQueryOptions();
	  const NHQO = Ci.nsINavHistoryQueryOptions;
	  var sortingMode;
	  var resultType;
	  if (aInput) {
		query.searchTerms = aInput;
		sortingMode = NHQO.SORT_BY_TITLE_ASCENDING;
		resultType = NHQO.RESULTS_AS_URI;
	  }
	  else {
		gSearchBox = document.getElementById('search-box',this.myPanel);
		gSearchBox.value='' ;
		gHistoryGrouping = document.getElementById('viewButton',this.myPanel).getAttribute('selectedsort1');
		switch (gHistoryGrouping) {
		  case 'visited':
			resultType = NHQO.RESULTS_AS_URI;
			sortingMode = NHQO.SORT_BY_VISITCOUNT_DESCENDING;
			break; 
		  case 'lastvisited':
			resultType = NHQO.RESULTS_AS_URI;
			sortingMode = NHQO.SORT_BY_DATE_DESCENDING;
			break; 
		  case 'dayandsite':
			resultType = NHQO.RESULTS_AS_DATE_SITE_QUERY;
			break;
		  case 'site':
			resultType = NHQO.RESULTS_AS_SITE_QUERY;
			sortingMode = NHQO.SORT_BY_TITLE_ASCENDING;
			break;
		  case 'day':
		  default:
			resultType = NHQO.RESULTS_AS_DATE_QUERY;
			break;
			}
		}
		options.sortingMode = sortingMode;
		options.resultType = resultType;
		var gHistoryTree = document.getElementById('myHistoryTree',this.myPanel);
		gHistoryTree.load([query], options);
	},
	mySelectTab :null ,
	nativeJSON : Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON),
	currentList : [] ,
	firstOpenCCC : true ,
	currentCmd :null ,
	imgList : null ,
	imgIdList:null ,
	savedImageList :"myFirefoxTab.myPanel.savedImageList",	
	sidebar :null,
	CurrentRadio : "" ,
	myGroup:null ,
	isFocus:false ,
	sidebarCmd:null,
	mySidebarBox:null ,
	
	init: function(){
		this.getList() ;
		this.getSideBoxCmd() ;
		this.getBookmarkMenuButton() ;
	},
    getList : function(){
		var myList=null;
		
		var currentList= this.currentList  ;
		if(currentList.length != 0) {
			myList=currentList;
		}
		else{
			myList=[];
			var mainBcs = document.getElementById('mainBroadcasterSet') ;
			var passList="|viewBookmarksSidebar|viewHistorySidebar" ;
			for (var i=0 ;i < mainBcs.childNodes.length;i++){
				var n= mainBcs.childNodes[i] ;				
				var tabUrl = n.getAttribute('sidebarurl') ;	
				if(tabUrl){
					var tabId = n.getAttribute('id') ;
					var tabLabel =n.getAttribute('label') ;
					if(tabId  && tabLabel && passList.indexOf(tabId) == -1){					
						if(n.hasAttribute('checked')) n.removeAttribute('checked') ;					
						var cmd =  n.getAttribute('oncommand') ;
						var isUsed =false ;
						var tab={'id': tabId , 'title': tabLabel , 'url': tabUrl , 'used': isUsed , 'cmd' : cmd}
						myList.push(tab); 
					}
				}
			}
			this.currentList= myList ; 
		}
		return myList ;
	},
	setTabCCC :function() {
		var myPanel=document.getElementById("myPanel") ;
		if(!this.sidebar) this.sidebar=document.getElementById("mySidebar",myPanel);
		if(!this.mySelectTab) this.mySelectTab=document.getElementById('mySelectTab',myPanel);
		if(!this.myGroup)	this.myGroup= document.getElementById("myAddOnsGroup",myPanel);	
		if(!this.mySidebarBox) this.mySidebarBox=document.getElementById("mySidebarBox",myPanel) ;
		if(!this.imgIdList){
			var img=null ;
			try { 
				img = gPrefService.getCharPref(this.savedImageList);
			} 
			catch(e) {
				img = false;
			}		
			if (img) img=this.nativeJSON.decode(img) ;
			else img= [] ; 
			this.imgIdList=img;
		}
		var myList=this.getList() ;
		if(myList.length >0 ) {
			var myTabCCC=document.getElementById('CCC',myPanel) ;	
			myTabCCC.setAttribute('moz-collapsed', 'false');		
		}
	},
	getSideBoxCmd :function() {	
		var sideBox= document.getElementById('sidebar-box');
		this.sidebarCmd=sideBox.getAttribute('sidebarcommand')
		sideBox.addEventListener('DOMAttrModified',function(e){
			var sidebarCmd=this.getAttribute('sidebarcommand') ;
			if(sidebarCmd.length>0) myBookMarkJs.sidebarCmd=this.getAttribute('sidebarcommand') ;
		},false);	
	},
	setSidebarCloseCmd : function(){
		var sideBox= document.getElementById('sidebar-box');
		var sidebar=document.getElementById('sidebar',sideBox);	
		sidebar.setAttribute('style','');			
		sideBox.setAttribute('width',setPanelSize.currentSize.width-3);	
		var myBookMarksTabs=document.getElementById('myBookMarksTabs');
		var strCmd =myBookMarksTabs.getAttribute("value") ; 
		if(strCmd.length==0){
			var value=document.getElementById('myAddOnsGroup').getAttribute('currentRadio') ;
			if(value){
				strCmd = value ;
				if(cmd= strCmd.match(/toggleSidebar\('(.+)'\).+/)){
					strCmd = cmd[1] ;
				}
				else if(cmd= strCmd.match(/.+toggleSidebar\('(.+)'\).+/)){
					strCmd = cmd[1] ;
				}
			}
		}
		if(strCmd) toggleSidebar(strCmd) ;		
		myBookMarkJs.onPanelClose('OpenSideBar') ;
		document.getElementById('myPanel').hidePopup() ;
	},
	mySideBarHideboxLoad : function(browser){
		if(!myBookMarkJs.isFocus){
			var mySideBarHidebox=document.getElementById('mySideBarHidebox') ;
			mySideBarHidebox.removeAttribute('src') ;
			mySideBarHidebox.setAttribute('src','chrome://global/skin/myFirefoxTab/myAddOnsHide.xul');
			this.isFocus=true ;	
		}
	},
	openAddOnsPanel : function(){
		if(this.firstOpenCCC){
			this.setTabButtons();
			this.firstOpenCCC=false ;
		}
	},	
	getImageList : function(){	
		if(!this.imgList || this.imgList.length == 0){
			var list=[] ;
			var gToolbox= document.getElementById("navigator-toolbox");	
			var n = gToolbox.palette.firstChild;
			while (n) {
				if(n.hasAttribute('label')){
					var newItem={'label':n.getAttribute('label'), 'id':n.id , 'class':n.getAttribute('class')}
					list.push(newItem);
				}
				n = n.nextSibling;
			}
			this.imgList=list ;	
		}
		return this.imgList ;
	},
	cteateTabPopMenu : function(){
		var tabPopup =document.getElementById("selectTabPop");	
		while(tabPopup.firstChild) tabPopup.removeChild(tabPopup.firstChild);
		var selectedTabs =  document.getElementById('mySelectTab').getAttribute("selectedTabs") ;
		var myList=this.getList() ;
		for (var i=0 ;i<myList.length ;i++){
			var list=myList[i] ;
			if (selectedTabs.indexOf(list.id) > 0) list.used=true ;
			var m = document.createElement('menuitem');
			m.setAttribute('id',  "tabList" + i);				
			m.setAttribute('label', list.title );
			m.setAttribute('type', 'checkbox');
			m.setAttribute('value', i);	
			m.setAttribute('checked',list.used);				
			m.setAttribute('oncommand',"myBookMarkJs.menuChaged(this , '"+list.title + "','" +list.url +"');");
			tabPopup.appendChild(m) ;			
		}
	},
	menuChaged : function (menuItem ,title ,url) {
		var SelectTab=this.mySelectTab ;
		var n=menuItem.getAttribute('value') ;		
		this.currentList[n].used =!this.currentList[n].used ;		
		var strSelectTab=SelectTab.getAttribute("selectedTabs");
		var strId="|" + this.currentList[n].id  ;		
		strSelectTab=strSelectTab.replace(strId,"") ;
		if(this.currentList[n].used) strSelectTab += strId ;
		
		SelectTab.setAttribute("selectedTabs",strSelectTab);
		this.setTabButtons() ;
	},
	setTabButtons : function(){
		var myGroup=this.myGroup ;
		this.CurrentRadio=myGroup.getAttribute('currentRadio') ;
		myGroup.setAttribute("value",null);				
		while(myGroup.firstChild) myGroup.removeChild(myGroup.firstChild);	
		this.currentCmd=null ;	
		var myList=[] ;
		var currentList= this.currentList ;
		for(n in currentList) myList.push(currentList[n]);
		
		var imgList=[];
		var list=this.imgIdList ;
		for(n in list)	imgList.push(list[n]);
				
		var mySelectTab=this.mySelectTab ;		
		var strSelectTab=mySelectTab.getAttribute("selectedTabs");		
		var arr=strSelectTab.split("|");
		for (var i=1 ;i<arr.length ;i++){
			for (j in myList){
				var list = myList[j];
				if(arr[i]==list.id) {
					this.AddRadio(myGroup,list,imgList) ;
					myList.splice(j,1);
					break;
				}
			}				
		}
		if(this.currentCmd ) myBookMarkJs.myToggleSidebar(this.currentCmd);			
		else this.myToggleSidebar("about:blank") ;
	},
	AddRadio :function(group,list,imgList){
		var myGroup= group ; 
		var cmd= "myBookMarkJs.myToggleSidebar('" + list.url + "');" ;	
		var myImag=myBookMarkJs.getImg(list.title,imgList) ;
		var r = document.createElement('toolbarbutton');
		if(myImag){
			r.setAttribute('id', myImag.id );
			r.setAttribute('class',myImag.class);
		}
		else{
			r.setAttribute('id',"myPanelNoFind");
			r.setAttribute('class','');			
		}
		r.setAttribute('tooltiptext',list.title );
		r.setAttribute('url',  list.url );		
		r.setAttribute('type', "radio" );
		r.setAttribute('value', list.cmd );				
		r.setAttribute('group', "myAddOnsGroup" );
		r.setAttribute("oncommand","myBookMarkJs.ButtonClick(this)");
		if( list.cmd== myBookMarkJs.CurrentRadio){
			r.setAttribute("checked",true);
			myBookMarkJs.currentCmd=list.url;
		}
		myGroup.appendChild(r);	
		return;
	},
		
	ButtonClick :function(button){
		var currentRadio=button.parentNode.getAttribute('currentRadio') ;
		var value =button.getAttribute('value' ) ;
		if(currentRadio!=value ) {
			this.myToggleSidebar(button.getAttribute("url")) ;	
			button.parentNode.setAttribute('currentRadio',button.getAttribute('value' )) ;
		}
		else 
		{
			this.myToggleSidebar("about:blank") ;	
			button.parentNode.setAttribute('currentRadio',"") ;	
			button.removeAttribute('checked') ;	
		}
	},
	getImg :function(label , imgList){
		var img=null ;
		for (var i=0 ;i< imgList.length; i++){
			var n=imgList[i] ;
			if(label==n.label){
				img=n;
				imgList.splice(i,1);
				break ;
			}
		}
		if(!img) {						
			imgList= myBookMarkJs.getImageList();
			for (var i=0 ;i< imgList.length; i++){
				var n=imgList[i] ;
				if(label==n.label){
					img=n;
					break ;
				}
			}
			this.saveImageList(img) ;
		}
		if(!img) {
			var gToolbox= document.getElementById("navigator-toolbox");	
			var imgList= gToolbox.getElementsByTagName("toolbarbutton");
			for (var i=0 ;i< imgList.length; i++){
				var n=imgList[i] ;
				if(label==n.getAttribute('label')){
					img=n;
					break ;
				}
			}
			this.saveImageList(img) ;			
		}
		return img ;		
	},	
	saveImageList :function(img){
		if(img) {
			this.imgIdList.push(img);
			if(this.imgIdList.length >=15) gPrefService.setCharPref(this.savedImageList,"");	
			else gPrefService.setCharPref(this.savedImageList,this.nativeJSON.encode(this.imgIdList));
		}		
	},
	myToggleSidebar : function ( myUrl ) {
		sidebar=this.sidebar ;
		sidebar.setAttribute("src", myUrl);
	},
	myGetFxva: function () {
		var url='https://addons.mozilla.org/en-US/firefox/addon/5992' ;
		loadURI(url);
		document.getElementById('myPanel').hidePopup() ;
	}
 }
myBookMarkJs.init();
var setPanelSize ={
	currentSize : null ,
	myPanel : null,
	myPanelBox :null ,
	myPanelHead:null ,
	maxHeight:null ,
	maxWidth:500 ,
	isDragBegin :false ,
	DragType:0 ,
	startPosition :null,
	savedPanelSize :"myFirefoxTab.setPanelSize.savedPanelSize",
	nativeJSON : Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON),
	isSizeChanded:true,
	saveSize : function (){
		var size=this.nativeJSON.encode(this.currentSize);
		gPrefService.setCharPref(this.savedPanelSize,size);
	},
	loadSize : function (myPanel){
		if(!this.myPanel) 	this.myPanel=myPanel;
		var maxHeight=gBrowser.parentNode.boxObject.height;
		if(this.isSizeChanded || this.maxHeight!=maxHeight){
			this.maxHeight=maxHeight;
			this.setPanel(this.currentSize) ;
			this.isSizeChanded=false ;
		}
	},
	init: function () {
		if(!this.myPanelBox){
			this.myPanel=document.getElementById("myPanel");
			this.myPanelBox =document.getElementById("myPanelBox" , this.myPanel);
			this.myPanelHead =document.getElementById("myPanelHead" , this.myPanel);
			this.maxHeight=gBrowser.boxObject.height;			
			window.addEventListener("mousemove",setPanelSize.onMouseMove , true);		
			window.addEventListener("mouseup",setPanelSize.onMouseUp , true);
			window.removeEventListener("unload", function(event){	
				window.removeEventListener("mousemove",setPanelSize.onMouseMove , true);		
				window.removeEventListener("mouseup",setPanelSize.onMouseUp , true);
			},false);	
		}
		if(this.currentSize==null){
			var size=null ;
			try {
				size = gPrefService.getCharPref(this.savedPanelSize);
			} catch(e) {
				size = false;
			}		
			if (size) size=this.nativeJSON.decode(size) ;
			else{
				size= {"width":250, "height":550} ;
			}
			this.currentSize=size ;	
		}		
	},
	onBeginDrag : function (event,type) {
		startPosition={"screenX":event.screenX , "screenY":event.screenY} ; 
		setPanelSize.isDragBegin=true ;
		setPanelSize.DragType=type ;
	},
	timeCount:0,
	onMouseMove : function (event){
		var self=setPanelSize ;
		if(!self.isDragBegin) return ;
		var size= {"width":0, "height":0} ;
		switch(self.DragType) {
			case 0:
				size.width=self.currentSize.width +  event.screenX  - this.startPosition.screenX ;
				size.height=self.currentSize.height ;
				break ;
			case 1:
				size.width=self.currentSize.width  ;
				size.height=self.currentSize.height +  event.screenY  - this.startPosition.screenY ;
				break ;				
			case 2:
				size.width=self.currentSize.width +  event.screenX  - this.startPosition.screenX ;
				size.height=self.currentSize.height +  event.screenY  - this.startPosition.screenY ;
				break ;	
		}
		self.timeCount++;
		if(self.timeCount%5==0) setPanelSize.setPanel(size); ;
	},
	onMouseUp : function(){
		var self=setPanelSize ;		
		if(!self.isDragBegin) return ;
		self.currentSize ={"width":self.myPanelBox.boxObject.width, "height": self.myPanel.boxObject.height} ;
		self.saveSize() ;
		this.isSizeChanded=true ;
		self.isDragBegin=false ;
	},
	setPanel : function (size) {
		var panelWith =size.width > this.maxWidth ? this.maxWidth :size.width ;
		var panelHeight=size.height > this.maxHeight ?  this.maxHeight : size.height ;
		if(!this.myPanelHead) this.init();
		this.myPanel.height=panelHeight;
		this.myPanelHead.width=panelWith ;		
		this.myPanelBox.width=panelWith ;
	}
}

