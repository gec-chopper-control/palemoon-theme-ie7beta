/*       声明。
//本功能由Fly_world 设计。
*/

var mySetState = {	
	init : function(){
		this.setPersonalToolbar() ;
		this.setGlasser() ;
		this.setTabBar() ;
		this.setTreeStyleTab() ;
	},
	treeStyleTab : false ,
	createMenuPopup :function(menupopup,label , value,checked){
		var m = document.createElement('menuitem');
		m.setAttribute('label',label);
		m.setAttribute('value',value);		
		m.setAttribute('checked',value==checked ? true:false);
		m.setAttribute('type','radio');
		m.addEventListener('command', function() {
			var toolbox = document.getElementById("navigator-toolbox");
			var value=this.getAttribute('value') ;
			var fieldName="myBookmarkTitleWidths" ;			
			toolbox.setAttribute(fieldName,value);
			document.persist(toolbox.id, fieldName);
		}, false);
		menupopup.appendChild(m);
		return menupopup ;
	},
	
	//判断是否有安装glasser
	setGlasser: function(){
		var navBar=document.getElementById("nav-bar") ;
		var win = document.getElementById('main-window');
		var fieldName="glasser";
		if (navBar.getAttribute("glassToMe")) win.setAttribute(fieldName, true);
		else win.setAttribute(fieldName, false);
		document.persist(win.id,fieldName);
	},
	
	//判断是否安装treeStyleTab
	setTreeStyleTab :function(){
		if(gBrowser.hasAttribute("treestyletab-tabbar-position")) this.treeStyleTab=true ;
	},
	
	// 记录PersonalToolbar是否DOMAttrModified
	setPersonalToolbar: function(){
		var win=document.getElementById("main-window");
		if(!win || win.hasAttribute("myfxva-homeButton")) return ;
		//bookmarks toolbar
		var bktoolbar = document.getElementById("PersonalToolbar");
		var toolbox=bktoolbar.parentNode ;
		var fieldName="PersonalToolbar" ;
		if(!toolbox.hasAttribute(fieldName)) {
			toolbox.setAttribute(fieldName, !bktoolbar.collapsed);
			document.persist(toolbox.id, fieldName);
		}
		
		var fieldName="myBookmarkTitleWidths" ;		
		if(!toolbox.hasAttribute(fieldName)) {
			toolbox.setAttribute(fieldName, 0);
			document.persist(toolbox.id, fieldName);
		}
		var checked=toolbox.getAttribute(fieldName) ;

		var menu = document.createElement('menu');
		menu.setAttribute('id',"myPlaceItemWidth");
		menu.setAttribute('label',"Customize Title Widths");
		var setWidthsPopup = document.createElement('menupopup');
		setWidthsPopup =this.createMenuPopup(setWidthsPopup,"Long Titles",0, checked) ;
		setWidthsPopup =this.createMenuPopup(setWidthsPopup,"Short Titles",1, checked) ;
		setWidthsPopup =this.createMenuPopup(setWidthsPopup,"Icons Only",2, checked) ;	
		menu.appendChild(setWidthsPopup);
		
		var placesContext = document.getElementById("placesContext");
		var placeInfo = document.getElementById("placesContext_show:info");
		placesContext.insertBefore(menu, placeInfo);				
		placesContext.insertBefore(document.createElement('menuseparator'), placeInfo);		
		
		bktoolbar.addEventListener("DOMAttrModified", function(event){
			if (event.attrName == "collapsed") this.parentNode.setAttribute("PersonalToolbar", !this.collapsed);
			document.persist(this.parentNode.id, 'PersonalToolbar');	
		}, true);
		bktoolbar.collapsed = bktoolbar.collapsed;
	},
	
	//对tab上的按钮进行设置。 version 当tab栏右侧的按钮ID有变更时，必须增加.
	setTabBar :function(){
		var version="4" ;
		var myFxVersion=gBrowser.getAttribute('myFxVersion');
		if(!myFxVersion || myFxVersion!=version){			
			var myPersist='myTabBookmarks-Menu myUndoClose myPersona myTabhome myFeed-button myTabdownloads myTabPrint myPageInfo mySecurity myOptions myGetFxva';	
			myPersist=myPersist.split(' ') ;
			for(var i=0 ;i < myPersist.length ;i++){
				var toolbar =null ;
				if(myPersist[i]=='myGetFxva') toolbar=document.getElementById('main-window');
				else toolbar=gBrowser;				
				if(!toolbar.hasAttribute(myPersist[i])){
					toolbar.setAttribute(myPersist[i],true) ;
					document.persist(toolbar.id, myPersist[i]);
				}
			}
			gBrowser.setAttribute('myFxVersion' ,version) ;
			document.persist(gBrowser.id,'myFxVersion' );
		}
	}
	
};

mySetState.init() ;