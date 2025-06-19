var myTabBar = {
	colorTab : true ,
	isNewTabCmd : false ,
	isFirstRun : true,	
	colorList :[
		{name : "green" },
		{name : "purple"},	
		{name : "yellow" },
		{name : "pink" }		
	],
	isLastTab:false ,
	currenColor : -1 ,
	savedColorTab :"myTabBar.isUseColorTab",
	ctrlTab : "browser.ctrlTab.previews",
	insertRelatedAfterCurrent:"browser.tabs.insertRelatedAfterCurrent",
	newTabLocation:null,
	isCnFox :null,		
	setTabOpenLocation: function (){
		var tabOpenLocation = null ;
		if (!gPrefService)
			gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
		  		.getService(Components.interfaces.nsIPrefBranch2);		
		try{
			tabOpenLocation = gPrefService.getBoolPref(this.insertRelatedAfterCurrent);
		} catch (e) {
			tabOpenLocation =false;
		}
		if(tabOpenLocation){
			gPrefService.setBoolPref(this.insertRelatedAfterCurrent,false);					
			this.newTabLocation=tabOpenLocation;
		}
		var me=this;
		window.addEventListener("unload", function(event){												   
			if(me.newTabLocation)	gPrefService.setBoolPref(me.insertRelatedAfterCurrent,me.newTabLocation);
		},false);
	},
	getColorTab : function (){
		var isUseColorTab = null ;
		if (!gPrefService)
			gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
		  		.getService(Components.interfaces.nsIPrefBranch2);		
		try{
			isUseColorTab = gPrefService.getBoolPref(this.savedColorTab);
		} catch (e) {
			gPrefService.setBoolPref(this.savedColorTab,true);
		}
		if(isUseColorTab != null) this.colorTab=isUseColorTab;
	},
	saveColorTab : function (value){
		this.colorTab= value=='true' ? true : false ;
		gPrefService.setBoolPref(this.savedColorTab,this.colorTab);
		var container = gBrowser.tabContainer;
		var tab=null ;
		if(!value){
			for(var i=0 ;i<container.childNodes.length ;i++) {
				tab=container.childNodes[i] ;
				if(tab.hasAttribute("color")){
					tab.setAttribute("group",tab.color);
					tab.removeAttribute("color") ;
					tab.color="default";
				}
			}
		}
		else{
			for(var i=0 ;i<container.childNodes.length ;i++) {
				tab=container.childNodes[i] ;
				if(tab.hasAttribute("group")){
					tab.setAttribute("color",tab.getAttribute("group"));
					tab.color=tab.getAttribute("group");
					tab.removeAttribute("group") ;			
				}
			}			
		}
	},
	getColor : function(tab){
		var preTab=tab.previousSibling;	
		var nextTab=tab.nextSibling.nextSibling ;
		var preColor=null ;
		var nextColor=null ;		
		if(!preTab  || !(preColor=preTab.color)) preColor="" ;
		if(!nextTab || !(nextColor=nextTab.color)) nextColor="" ;	
		var n=myTabBar.currenColor ;
		var color= null ;
		while(n += 1){
			if (n >= myTabBar.colorList.length)  n=0 ;					
			color=myTabBar.colorList[n].name ;	
			if(color != preColor &&  color != nextColor) break;
		}
		myTabBar.currenColor=n ;
		var color= myTabBar.colorList[n].name ;			
		return color;
	},
	setColorDefalut : function(){
		var container = gBrowser.tabContainer;
		var group=false ;
		var color=null ;
		var nextColor=null ;
		var tab=null ;
		var nextTab=null ;
		for(var i=0 ;i<container.childNodes.length ;i++) {
			tab=container.childNodes[i] ;
			color= tab.color ;
			nextTab=tab.nextSibling ;
			if(nextTab) nextColor=nextTab.color ;
			else nextColor=null ;
			if(color && color!="default" ){
				if(nextColor && nextColor==color){
					group=true ;
				}
				else{
					if(!group){
						tab.setAttribute("color", "default" ) ;
						tab.color="default";
					}
					group=false ;
				}					
			}		
		}
	},	
	setTabbarEvent : function(){		
		function TabAdded(event){			
			if(!myTabBar.colorTab) return ;
			var tab = event.target;			
			var tabBox=gBrowser.tabContainer;			
			if(myTabBar.isNewTabCmd){
				if(myTabBar.isCnFox && tabBox.itemCount >= 2) gBrowser.moveTabTo(tab,tabBox.itemCount-1) ;	
				return ;
			}
			var curTab=gBrowser.mCurrentTab ;
			var curPos=curTab._tPos;
			var color=null ;

			if(myTabBar.isLastTab){
				var preTab=tab.previousSibling ;
				if(preTab) preTab.setAttribute("selected",false) ;
				gBrowser.moveTabTo(tab,0) ;
				tab.setAttribute("selected","true") ;	
				return ;
			}

			if(tabBox.itemCount==1) return;
			if(!curTab.color || curTab.color=="default"){				
				myTabBar.isNewTabCmd=true ;				
				gBrowser.moveTabTo(tab,curPos+1) ;
				myTabBar.isNewTabCmd=false ;
				color=myTabBar.getColor(curTab) ;
				curTab.setAttribute("color",color) ;
				curTab.color=color;
				tab.setAttribute("color",color ) ;
				tab.color=color;
			}
			else {	
				color=curTab.color ;
				var nextTab=curTab.nextSibling ;
				var no=1 ;
				while(nextTab && nextTab.color==color) {
					no++ ;					
					nextTab=nextTab.nextSibling ;
				}
				if(nextTab){
					var index=tabBox.selectedIndex + no ;
					if(index < tabBox.itemCount-1){
						myTabBar.isNewTabCmd=true ;
						gBrowser.moveTabTo(tab,index) ;
						myTabBar.isNewTabCmd=false ;
					}				
				}
				tab.setAttribute("color",color) ;
				tab.color=color;
			}
	    }
		
		function TabMoved(event)
		{
			if(!myTabBar.colorTab) return ;
			if(	myTabBar.isNewTabCmd) return ;
			var tab =event.target ;
			
			var preTab=tab.previousSibling;	
			var nextTab=tab.nextSibling ;
			
			if(preTab && nextTab && preTab.color==nextTab.color){
				var color=preTab.color;
				tab.setAttribute("color",color);
				tab.color=color;
			}
			myTabBar.setColorDefalut() ;
		}
		
		function TabRemoved(event)
		{
			var tab =event.target ;	
			/* 当关闭最后一个tab 时。isLastTab为true*/
			var l = gBrowser.mTabs.length - gBrowser._removingTabs.length;	
			if(l==0){
				myTabBar.isLastTab=true ;
				return ;
			}
							
			/*此句用于FF3.5，将只有一个tab时，不加此句，tab栏的左侧会出现一点点空隙*/
			var tabbar=gBrowser.tabContainer ;
			if(!tabbar.hasAttribute("unreadTab")){			
				if(tabbar.itemCount <= 2){gBrowser.moveTabTo(tab,1) ;} 
				else if(tabbar.selectedIndex==0 && tab._tPos==0) tabbar.advanceSelectedTab(1, true);
				else if(tabbar.getAttribute("overflow") && (tab._tPos==tabbar.itemCount-1))
					gBrowser.moveTabTo(tab,tab._tPos-1) ;
			}
		
			if(!myTabBar.colorTab) return ;
			var color=tab.color ;	
			var preTab=tab.previousSibling;			
			var nextTab=tab.nextSibling ;
			if(!color || color=="default") {
				if(preTab && nextTab) {
					var preColor=preTab.color;
					var nextColor=nextTab.color;
					if(preColor && nextColor && preColor==nextColor && preColor!="default"){
						color=myTabBar.getColor(tab) ;
						while(nextTab && nextTab.color==preColor){
							nextTab.setAttribute("color", color) ;
							nextTab.color=color;
							nextTab=nextTab.nextSibling ;
						}
					}
				}
				return ;				
			}
			
			if(!nextTab || (nextTab && nextTab.color!=color)){
				if(preTab){
					var startTab=preTab.previousSibling;
					if(!startTab || startTab.color!=color){
						preTab.setAttribute("color","default") ;
						preTab.color="default";
					}
					return ;
				}
			}
			
			if(!preTab || (preTab && preTab.color!=color)) {
				if(nextTab){
					var endTab=nextTab.nextSibling ;
					if(!endTab || endTab.color!=color){
						nextTab.setAttribute("color","default" ) ;
						nextTab.color="default";
					}
					return ;
				}
			}
		}
		
		// During initialisation
		var container = gBrowser.tabContainer;
		container.addEventListener("TabOpen", TabAdded, false);
		container.addEventListener("TabMove", TabMoved, false);
		container.addEventListener("TabClose", TabRemoved, false);
		window.addEventListener("unload", function(event){	
			container.removeEventListener("TabOpen", TabAdded, false);
			container.removeEventListener("TabMove", TabMoved, false);
			container.removeEventListener("TabClose", TabRemoved, false);
		},false);		
	},
	
	
	/*记住one-tab值 */
	saveOneTab : function(){
		gBrowser.setAttribute("one-tab", gBrowser.tabContainer.itemCount==1);
		document.persist(gBrowser.id,"one-tab");		
		window.addEventListener("unload", function(event){
			gBrowser.setAttribute("one-tab", gBrowser.tabContainer.itemCount==1);
			var page = document.getElementById("browser.startup.page").value;
			switch (page) {
				case 0: 
					gBrowser.setAttribute("one-tab",true); 
					break;
				case 1:
					var homePage = document.getElementById("browser.startup.homepage").value.split("|");
					if(homePage.length==1) gBrowser.setAttribute("one-tab",true);
					else gBrowser.setAttribute("one-tab",false);
					break ;
			}
			document.persist(gBrowser.id,"one-tab");
		},false);
	},
	
	/*设置是否为一个tab */
	setOneTab: function(){
		tabbar=gBrowser.tabContainer;
		gBrowser.addEventListener("TabOpen", function(event){
			if(myTabBar.isLastTab){
				if(gBrowser.hasAttribute("treestyletab-tabbar-position") || tabbar.hasAttribute("unreadTab")){
					myTabBar.isLastTab=false ;
				}
				return ;
			}
			this.setAttribute("one-tab", this.tabContainer.itemCount == 1);
			document.persist(gBrowser.id,"one-tab");			
		}, false);			
		gBrowser.addEventListener("TabClose", function(event){
			this.setAttribute("one-tab",this.tabContainer.itemCount <= 2);
			document.persist(gBrowser.id,"one-tab");
		}, false);	
	},
	
	/*设置tab栏的宽度*/
	setTabWidth :  function () {
		tabbar=gBrowser.tabContainer;	
		if(gBrowser.hasAttribute("treestyletab-tabbar-position") || tabbar.hasAttribute("unreadTab")) return ;		
		tabbar.mTabMaxWidth=180 ;
		tabbar.mTabMinWidth=74 ;
		function lageSize(tab) {
			tab.maxWidth=299 ;
			tab.minWidth=170 ;	
		}
		function normalSize(tab){
			tab.maxWidth=180;
			tab.minWidth=74;
		}		
		gBrowser.addEventListener("TabOpen", function(){
			if(myTabBar.isLastTab){
				for (var tab=tabbar.firstChild; tab; tab=tab.nextSibling) {
					if(tab.minWidth) lageSize(tab) ;
				}
				myTabBar.isLastTab=false ;
				return ;
			}			
			if(myTabBar.isFirstRun){												  
				for (var tab=tabbar.firstChild; tab; tab=tab.nextSibling) {
					if(tab.minWidth) normalSize(tab);
				}
				if(tabbar.hasAttribute("overflow")) {
					 var arrowscrollbox = document.getAnonymousElementByAttribute(tabbar,"anonid","arrowscrollbox");
					 arrowscrollbox._startScroll(1);
					 arrowscrollbox._continueScroll(1);
				}
				myTabBar.isFirstRun=false ;
			}
			switch(tabbar.itemCount){
				case 1:
					var tab=tabbar.firstChild ;
					lageSize(tab) ;
					break ;
				case 2:					
					var tab=tabbar.firstChild ;
 					normalSize(tab) ;
			}
	 	}, false);
		
		gBrowser.addEventListener("TabClose", function(event){
			if(myTabBar.isFirstRun){
				var onetab=tabbar.itemCount <= 2 ;
				for (var tab=tabbar.firstChild; tab; tab=tab.nextSibling) {
					if(tab.minWidth){
						if(onetab) lageSize(tab) ;
						else normalSize(tab);
					}
				}
				myTabBar.isFirstRun=false ;
			}
			if(tabbar.itemCount <= 2 ){
				for (var tab=tabbar.firstChild; tab; tab=tab.nextSibling) {
					if(tab.minWidth) lageSize(tab);
				}
			}			
	  	}, false);		
	},

	/*从新页面中打开*/ 
	openInNewTab : function () {	
	  	document.getElementById('cmd_newNavigatorTab').setAttribute("oncommand","myTabBar.addNewTab();") ;
	  	var bookmarkContent=document.getElementById('bookmarksBarContent') ;
	  	var bookmarksMenuPopup=document.getElementById('bookmarksMenuPopup') ;	
		var curCmd=bookmarkContent.getAttribute("onclick") ;
		var bookmarkCilck="myTabBar.isNewTabCmd=true;" + curCmd + "; myTabBar.isNewTabCmd=false;"
		bookmarkContent.setAttribute("onclick",bookmarkCilck) ;
		bookmarksMenuPopup.setAttribute("onclick",bookmarkCilck) ;	
		
		curCmd=bookmarksMenuPopup.getAttribute("oncommand") ;
		var bookmarkCommand="myTabBar.isNewTabCmd=true;" + curCmd + ";myTabBar.isNewTabCmd=false;"
		bookmarkContent.setAttribute("oncommand",bookmarkCommand) ;	
		bookmarksMenuPopup.setAttribute("oncommand",bookmarkCommand) ;			
		gBrowser.tabContainer.setAttribute("ondblclick",
			 "myTabBar.isNewTabCmd=true ;this.parentNode.parentNode.parentNode.onTabBarDblClick(event);"
			+"myTabBar.isNewTabCmd=false ;") ;	
	},
	
	/*当按新tab按钮时执行*/
	addNewTab : function () {	
		this.isNewTabCmd=true ;
		BrowserOpenTab();
		this.isNewTabCmd=false ;			
		var tab = gBrowser.tabContainer.lastChild;
		tab.setAttribute("color","default") ;	
	},	

	/* 对火狐中国版进行支持 ，不然tab移动的位置莫名其妙*/
	forChinaFox :function(){
		if(gBrowser.addTab.toString().indexOf('this.moveTabTo') >0) this.isCnFox=true;
	},	

	/*进行初始化*/	
	init : function () {
		this.setTabOpenLocation();		
		this.openInNewTab() ;
		this.setOneTab() ;
		this.setTabWidth() ;
		this.saveOneTab() ;
		this.forChinaFox() ;
		this.setTabbarEvent() ;		
		this.getColorTab() ;
	},
	
	/*将当前页面收藏到书签工具栏 */
	BookMarkCurrentPage :  function () {
		var aBrowser= getBrowser().selectedBrowser;
		var uri = aBrowser.currentURI;
		var itemId = PlacesUtils.getMostRecentBookmarkForURI(uri);
		var parent = PlacesUtils.toolbarFolderId ;
		
		if (itemId == -1) {
			var webNav = aBrowser.webNavigation;
			var url = webNav.currentURI;
			var title;
			var description;
			try {
				title = webNav.document.title || url.spec;
				description = PlacesUIUtils.getDescriptionFromDocument(webNav.document);
			}
			catch (e) { }
			var descAnno = { name: DESCRIPTION_ANNO, value: description };
			var txn = PlacesUIUtils.ptm.createItem(uri, parent, -1, title, null, [descAnno]);
				PlacesUIUtils.ptm.doTransaction(txn);			
		}
		else{
			PlacesCommandHook.bookmarkCurrentPage(true, PlacesUtils.toolbarFolderId);
		}
	}	
};

myTabBar.init() ;