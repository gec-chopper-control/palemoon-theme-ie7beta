/*       声明。
//本功能由Fly_world 设计。

*/

/*-----------------------------------支持personal------------------------------------------------*/


var myLightWeightThemeWebInstaller = {
  isClear :true,
  _previewWindow: null,
  _previewTimeoutID:null,
  _resetTimeoutID:null,
  _previewTimeout:200,
  
  get win() {
    delete this.win;
    return this.win=document.getElementById("main-window") ;
  },
  
  get bottomBox() {
    delete this.bottomBox;
    return this.bottomBox=document.getElementById("browser-bottombox");
  },	
	
  init : function(){
	 //判断支持Firefox 3.5
	 var hasLightWeightTheme;
	 var field="noLightWeightTheme";	 
	 try{
		var pref="extensions.lastAppVersion";
        var lastVersion=gPrefService.getCharPref(pref);	
		if(parseFloat(lastVersion)>=3.6) hasLightWeightTheme =true;
	 } catch (e) {}
	 if(!hasLightWeightTheme){		 
		 if(!gBrowser.getAttribute(field)){
			 gBrowser.setAttribute(field,true);
			 document.persist(gBrowser.id, field);			 
		 }
		 this.clearSetting();
		 return;
	 }
	 else {
		 if(gBrowser.getAttribute(field)){
			 gBrowser.removeAttribute(field);
			 document.persist(gBrowser.id, field);
		 }
		 var showCase=document.getElementById("myShowCaseButton");
		 showCase.setAttribute("onclick","allTabs.open();")
		 showCase.removeChild(showCase.lastChild);
	 }
	 
	 //判断是否安装了persona
	 try {
		var pref="extensions.personas.lastversion";
        var personaId=gPrefService.getCharPref(pref);
		pref="extensions.personas.selected";
		var personaSelected=gPrefService.getCharPref(pref);
     } catch (e) {}
	if(personaId) {
		if(parseFloat(personaId )>= 1.5 && personaSelected){			
			var menuPopup= document.getElementById("personas-selector-menu");
			if(menuPopup) menuPopup.setAttribute("onpopupshowing",
			"PersonaController.onPopupShowing(event) ;myLightWeightThemeWebInstaller.supportPersona(this); return;");			
		}
		else if(parseFloat(personaId )<1.5 && personaSelected){
			var myPersona= document.getElementById("myPersona");
			myPersona.style.display="none";
			return this.clearSetting();
		}
	}
		
	var mPan=gBrowser.mPanelContainer;
	mPan.removeEventListener("InstallBrowserTheme", LightWeightThemeWebInstaller, false);
	mPan.removeEventListener("PreviewBrowserTheme", LightWeightThemeWebInstaller, false);
	mPan.removeEventListener("ResetBrowserThemePreview", LightWeightThemeWebInstaller,false);
	  
	mPan.addEventListener("InstallBrowserTheme", myLightWeightThemeWebInstaller, false, true);
	mPan.addEventListener("PreviewBrowserTheme", myLightWeightThemeWebInstaller, false, true);
	mPan.addEventListener("ResetBrowserThemePreview", myLightWeightThemeWebInstaller, false, true);


	var me=this;
	window.addEventListener("unload", function(event){	
		me.removeStyle();
		me.shutDown();
	},false);
  },
  
  //关闭FF时，去除事件。
  shutDown: function(){
	var mPan=gBrowser.mPanelContainer;	  
	mPan.removeEventListener("InstallBrowserTheme", myLightWeightThemeWebInstaller, false);
	mPan.removeEventListener("PreviewBrowserTheme", myLightWeightThemeWebInstaller, false);
	mPan.removeEventListener("ResetBrowserThemePreview", myLightWeightThemeWebInstaller, false);	  
  },
  
  //如果FF中没有lightWeight功能则去除Style.
  removeStyle :function(){
	try {
		var pref="extensions.lastSelectedSkin";
        var newSkin = gPrefService.getCharPref(pref);
    } catch (e) {}
	if(newSkin) this.clearSetting();
  },
  
  //去除自定义的设置
  clearSetting:function(){
	var styleIdField="styleId";
	var field="style";	
	var win=this.win	;
	var bottomBox=this.bottomBox;
	if(win.hasAttribute(styleIdField) && this.isClear){
		win.removeAttribute(styleIdField);	
		document.persist(win.id, styleIdField);		
		win.removeAttribute(field);
		document.persist(win.id, field);
		bottomBox.removeAttribute(field);
		document.persist(bottomBox.id, field);
		this.isClear=false;
	}
  },
  
  //保存当前的设置
  saveSetting:function(dataId){
	  	document.persist("main-window", "style");
	  	document.persist("browser-bottombox", "style");	
		document.getElementById("main-window").setAttribute("styleId",dataId);
		document.persist("main-window", "styleId");	 
		this.isClear=true;
  },

  
 //支持personal 
  supportPersona:function(menuPopup){
    let openingSeparator = document.getElementById("personasOpeningSeparator",menuPopup);
    let closingSeparator = document.getElementById("personasClosingSeparator",menuPopup);	
	var item=openingSeparator.nextSibling;

    while ( item != closingSeparator){
		this.setChildMenuItem(item);
		item=item.nextSibling;
	}
	
	item=closingSeparator.previousSibling.firstChild;
    for each(var node in item.childNodes){

		this.setChildMenuItem(node);
		
	}
  },
  
  setChildMenuItem:function(node){
	  me=this;
	  switch(node.tagName){
		  case "menuseparator": break;
		  case "menu": 
		  	menuPopup=node.firstChild;
			for(var i=0 ;i<menuPopup.childNodes.length;i++)				
				this.setChildMenuItem(menuPopup.childNodes[i]);
			break;
		  case "menupopup":
		  	menuPopup=node;
			for(var i=0 ;i<menuPopup.childNodes.length;i++)				
				this.setChildMenuItem(menuPopup.childNodes[i]);
			break;				
		  case "menuitem": 
			  if(node.hasAttribute("persona")) {
				node.addEventListener("DOMMenuItemActive",function(evt){me._preview(evt);}, false);
				node.addEventListener("DOMMenuItemInactive",function(evt){me._resetPreview(evt);}, false);
				node.setAttribute("oncommand","myLightWeightThemeWebInstaller._installRequest(event)");
			  }
			  break;
	  }
 
  },
  
/*----------------------------------*/ 
  
    handleEvent: function (event) {
    switch (event.type) {
      case "InstallBrowserTheme":
      case "PreviewBrowserTheme":
      case "ResetBrowserThemePreview":
        // ignore requests from background tabs
        if (event.target.ownerDocument.defaultView.top != content)
          return;
    }
    switch (event.type) {
      case "InstallBrowserTheme":
        this._installRequest(event);
        break;
      case "PreviewBrowserTheme":
        this._preview(event);
        break;
      case "ResetBrowserThemePreview":
        this._resetPreview(event);
        break;
      case "pagehide":
      case "TabSelect":
        this._resetPreview();
        break;
    }
  },

  get _manager () {
    var temp = {};
    delete this._manager;
    return this._manager = themeService;
  },
  
  changeTheme:function(event){
    var node = event.target;
    var theme = this._getThemeFromNode(node);
	this._manager.currentTheme =theme;
	this.saveSetting(theme.id);
  },

  _installRequest: function (event) {
    var node = event.target;
    var data = this._getThemeFromNode(node);
    if (!data) 	return;
    if (this._isAllowed(node)) return this._install(data);
    var allowButtonText =gNavigatorBundle.getString("lwthemeInstallRequest.allowButton");
    var allowButtonAccesskey =gNavigatorBundle.getString("lwthemeInstallRequest.allowButton.accesskey");
    var message =gNavigatorBundle.getFormattedString("lwthemeInstallRequest.message",
        [node.ownerDocument.location.host]);
    var buttons = [{
      label: allowButtonText,
      accessKey: allowButtonAccesskey,
      callback: function () {
        LightWeightThemeWebInstaller._install(data);
      }
    }];

    this._removePreviousNotifications();
    var notificationBox = gBrowser.getNotificationBox();
    var notificationBar =
      notificationBox.appendNotification(message, "lwtheme-install-request", "",
      notificationBox.PRIORITY_INFO_MEDIUM,
      buttons);
    notificationBar.persistence = 1;
  },

  _install: function (newTheme) {
    var previousTheme = this._manager.currentTheme;
    this._manager.currentTheme = newTheme;
    if (this._manager.currentTheme &&
        this._manager.currentTheme.id == newTheme.id)
      this._postInstallNotification(newTheme, previousTheme);
  },

  _postInstallNotification: function (newTheme, previousTheme) {
    function text(id) {
      return gNavigatorBundle.getString("lwthemePostInstallNotification." + id);
    }

    var buttons = [{
      label: text("undoButton"),
      accessKey: text("undoButton.accesskey"),
      callback: function () {
        LightWeightThemeWebInstaller._manager.forgetUsedTheme(newTheme.id);
        LightWeightThemeWebInstaller._manager.currentTheme = previousTheme;
      }
    }, {
      label: text("manageButton"),
      accessKey: text("manageButton.accesskey"),
      callback: function () {
        BrowserOpenAddonsMgr("themes");
      }
    }];

    this._removePreviousNotifications();

    var notificationBox = gBrowser.getNotificationBox();
    var notificationBar =notificationBox.appendNotification(text("message"),
			"lwtheme-install-notification", "",
			notificationBox.PRIORITY_INFO_MEDIUM,
			buttons);
    notificationBar.persistence = 1;
    notificationBar.timeout = Date.now() + 10000; // 20 seconds
  },

  _removePreviousNotifications: function () {
    var box = gBrowser.getNotificationBox();

    ["lwtheme-install-request",
     "lwtheme-install-notification"].forEach(function (value) {
        var notification = box.getNotificationWithValue(value);
        if (notification)
          box.removeNotification(notification);
      });
  },

  _preview: function (event) { 
    if (!this._isAllowed(event.target))  return;
    var data = this._getThemeFromNode(event.target);
    if (!data) return;
    this._resetPreview();
    this._previewWindow = event.target.ownerDocument.defaultView;
    this._previewWindow.addEventListener("pagehide", this, true);
    gBrowser.tabContainer.addEventListener("TabSelect", this, false);
	
    if (this._resetTimeoutID) {
      window.clearTimeout(this._resetTimeoutID);
      this._resetTimeoutID = null;
    }
	
    let t = this;
    let callback = function() { t._manager.previewTheme(data)};
    this._previewTimeoutID = window.setTimeout(callback, this._previewTimeout);
	
  },

  _resetPreview: function (event) {
    if (!this._previewWindow || event && !this._isAllowed(event.target))
      return;
    if (this._previewTimeoutID) {
      window.clearTimeout(this._previewTimeoutID);
      this._previewTimeoutID = null;
    }
	  

    this._previewWindow.removeEventListener("pagehide", this, true);
    this._previewWindow = null;
    gBrowser.tabContainer.removeEventListener("TabSelect", this, false);
	var styleIdField="styleId";
	var styleId=this.win.getAttribute(styleIdField);
	if(styleId){
		let t = this;
		let callback = function() { t._manager.resetPreview() };
		this._resetTimeoutID = window.setTimeout(callback, this._previewTimeout);
	}
	else this.toDefault();	
  },
 
 toDefault: function(){
		var field="style";
		this.win.removeAttribute(field);
		this.bottomBox.removeAttribute(field);	
 },

  _isAllowed: function (node) {
	if(node.hasAttribute("persona") && node.tagName=="menuitem") return true;
    var pm = Cc["@mozilla.org/permissionmanager;1"].getService(Ci.nsIPermissionManager);

    var prefs = [["xpinstall.whitelist.add", pm.ALLOW_ACTION],
                 ["xpinstall.whitelist.add.36", pm.ALLOW_ACTION],
                 ["xpinstall.blacklist.add", pm.DENY_ACTION]];
    prefs.forEach(function ([pref, permission]) {
      try {
        var hosts = gPrefService.getCharPref(pref);
      } catch (e) {}

      if (hosts) {
        hosts.split(",").forEach(function (host) {
          pm.add(makeURI("http://" + host), "install", permission);
        });

        gPrefService.setCharPref(pref, "");
      }
    });

    var uri = node.ownerDocument.documentURIObject;
    return pm.testPermission(uri, "install") == pm.ALLOW_ACTION;
  },

  _getThemeFromNode: function (node) {
	var theme;
	if(node.hasAttribute("persona")) 
		theme = JSON.parse(node.getAttribute("persona"));
	else  
		theme =this._manager.parseTheme(node.getAttribute("data-browsertheme"), node.baseURI);
	  
    return theme;
  }
  
}

myLightWeightThemeWebInstaller.init();

/*----------------------------  lightWeightThemeService   ----------------------------------------------*/
var Cc = Components.classes;
var Ci = Components.interfaces;

var MAX_USED_THEMES_COUNT = 8;

var MAX_PREVIEW_SECONDS = 30;

var MANDATORY = ["id", "name", "headerURL"];
var OPTIONAL = ["footerURL", "textcolor", "accentcolor", "iconURL",
                  "previewURL", "author", "description", "homepageURL",
                  "updateURL", "version"];

var PERSIST_ENABLED = true;
var PERSIST_BYPASS_CACHE = false;
var PERSIST_FILES = {
  headerURL: "lightweighttheme-header",
  footerURL: "lightweighttheme-footer"
};

__defineGetter__("_prefs", function () {
  delete this._prefs;
  return this._prefs =
  Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("lightweightThemes.");
});

__defineGetter__("_observerService", function () {
  delete this._observerService;
  return this._observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
});

__defineGetter__("_ioService", function () {
  delete this._ioService;
  return this._ioService =Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
});

var themeService = {
  get usedThemes () {
    try {
      return JSON.parse(_prefs.getCharPref("usedThemes"));
    } catch (e) {
      return [];
    }
  },

  get currentTheme () {
    try {
        var data = this.usedThemes[0];
    } catch (e) {}

    return data || null;
  },

  get currentThemeForDisplay () {
    var data = this.currentTheme;

    if (data && PERSIST_ENABLED) {
      for (let key in PERSIST_FILES) {
        try {
          if (data[key] && _prefs.getBoolPref("persisted." + key))
            data[key] = _getLocalImageURI(PERSIST_FILES[key]).spec
                        + "?" + data.id + ";" + _version(data);
        } catch (e) {}
      }
    }

    return data;
  },

  set currentTheme (aData) {
    if (aData) {
		let usedThemes = _usedThemesExceptId(aData.id);
		usedThemes.unshift(aData);
		_updateUsedThemes(usedThemes);
		myLightWeightThemeWebInstaller.saveSetting(aData.id);
	}

    if (_previewTimer) {
      _previewTimer.cancel();
      _previewTimer = null;
    }

    _prefs.setBoolPref("isThemeSelected", false);
    _notifyWindows(aData);
   // _observerService.notifyObservers(null, "lightweight-theme-changed", null);

    if (PERSIST_ENABLED && aData)
      _persistImages(aData);
    return aData;
  },

  getUsedTheme: function (aId) {
    var usedThemes = this.usedThemes;
    for (let i = 0; i < usedThemes.length; i++) {
      if (usedThemes[i].id == aId)
        return usedThemes[i];
    }
    return null;
  },

  forgetUsedTheme: function (aId) {
    var currentTheme = this.currentTheme;
    if (currentTheme && currentTheme.id == aId)
      this.currentTheme = null;

    _updateUsedThemes(_usedThemesExceptId(aId));
  },

  previewTheme: function (aData) {
    if (!aData) return;
    if (_previewTimer) _previewTimer.cancel();
    else _previewTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);	
	_previewTimer.initWithCallback(_previewTimerCallback,MAX_PREVIEW_SECONDS * 1000,_previewTimer.TYPE_ONE_SHOT);
	_notifyWindows(aData);
  },

  resetPreview: function () {
    if (_previewTimer) {
      _previewTimer.cancel();
      _previewTimer = null;
      _notifyWindows(this.currentThemeForDisplay);
    }
  },

  parseTheme: function (aString, aBaseURI) {
    try {
      var data = JSON.parse(aString);
    } catch (e) {
      return null;
    }

    if (!data || typeof data != "object")
      return null;

    for (let prop in data) {
      if (typeof data[prop] == "string" &&
          (data[prop] = data[prop].trim()) &&
          (MANDATORY.indexOf(prop) > -1 || OPTIONAL.indexOf(prop) > -1)) {
        if (!/URL$/.test(prop))
          continue;

        try {
          data[prop] = _makeURI(data[prop], _makeURI(aBaseURI)).spec;
          if (/^https:/.test(data[prop]))
            continue;
          if (prop != "updateURL" && /^http:/.test(data[prop]))
            continue;
        } catch (e) {}
      }

      delete data[prop];
    }

    for (let i = 0; i < MANDATORY.length; i++) {
      if (!(MANDATORY[i] in data))
        return null;
    }
    return data;
  },

  updateCurrentTheme: function () {
    try {
      if (!_prefs.getBoolPref("update.enabled"))
        return;
    } catch (e) {
      return;
    }

    var theme = this.currentTheme;
    if (!theme || !theme.updateURL)
      return;

    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
                .createInstance(Ci.nsIXMLHttpRequest);

    req.mozBackgroundRequest = true;
    req.overrideMimeType("text/plain");
    req.open("GET", theme.updateURL, true);

    var self = this;
    req.onload = function () {
      if (req.status != 200)
        return;

      let newData = self.parseTheme(req.responseText, theme.updateURL);
      if (!newData ||
          newData.id != theme.id ||
          _version(newData) == _version(theme))
        return;

      var currentTheme = self.currentTheme;
      if (currentTheme && currentTheme.id == theme.id)
        self.currentTheme = newData;
    };

    req.send(null);
  }
};

function _usedThemesExceptId(aId)
  themeService.usedThemes.filter(function (t) t.id != aId);

function _version(aThemeData)
  aThemeData.version || "";

function _makeURI(aURL, aBaseURI)
  _ioService.newURI(aURL, null, aBaseURI);

function _updateUsedThemes(aList) {
  if (aList.length > MAX_USED_THEMES_COUNT)
    aList.length = MAX_USED_THEMES_COUNT;

  _prefs.setCharPref("usedThemes", JSON.stringify(aList));

  _observerService.notifyObservers(null, "lightweight-theme-list-changed", null);
}

function _notifyWindows(aThemeData) {
  _observerService.notifyObservers(null, "lightweight-theme-styling-update",JSON.stringify(aThemeData));
}

var _previewTimer;
var _previewTimerCallback = {
  notify: function () {
    themeService.resetPreview();
  }
};

function _persistImages(aData) {
  function onSuccess(key) function () {
    let current = themeService.currentTheme;
    if (current && current.id == aData.id)
      _prefs.setBoolPref("persisted." + key, true);
  };

  for (let key in PERSIST_FILES) {
    _prefs.setBoolPref("persisted." + key, false);
    if (aData[key])
      _persistImage(aData[key], PERSIST_FILES[key], onSuccess(key));
  }
}

function _getLocalImageURI(localFileName) {
  var localFile = Cc["@mozilla.org/file/directory_service;1"]
                     .getService(Ci.nsIProperties)
                     .get("ProfD", Ci.nsILocalFile);
  localFile.append(localFileName);
  return _ioService.newFileURI(localFile);
}

function _persistImage(sourceURL, localFileName, callback) {
  var targetURI = _getLocalImageURI(localFileName);
  var sourceURI = _makeURI(sourceURL);

  var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                  .createInstance(Ci.nsIWebBrowserPersist);

  persist.persistFlags =
    Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
    Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION |
    (PERSIST_BYPASS_CACHE ?
       Ci.nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE :
       Ci.nsIWebBrowserPersist.PERSIST_FLAGS_FROM_CACHE);

  persist.progressListener = new _persistProgressListener(callback);

  persist.saveURI(sourceURI, null, null, null, null, targetURI);
}

function _persistProgressListener(callback) {
  this.onLocationChange = function () {};
  this.onProgressChange = function () {};
  this.onStatusChange   = function () {};
  this.onSecurityChange = function () {};
  this.onStateChange    = function (aWebProgress, aRequest, aStateFlags, aStatus) {
    if (aRequest &&
        aStateFlags & Ci.nsIWebProgressListener.STATE_IS_NETWORK &&
        aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
      try {
        if (aRequest.QueryInterface(Ci.nsIHttpChannel).requestSucceeded) {
          // success
          callback();
          return;
        }
      } catch (e) { }
      // failure
    }
  };
}
