//        声明。
//本功能由Fly_world 设计。 
//仅参考了Locationbar2 的设计思路,代码由自已完全重新设计。
//在此对Dao Gottwald表示感谢 :)


var myFirefoxUrlBar = {
	// gURLBar 为地址栏。
	// 当鼠标在地址栏中第一次按下时，isfirstIn为true
	// 当鼠标在地址栏中第一次完成点击时，isEndIn为true	
	// strValue 是地址栏中将要显示的值。地址栏的value与显示内容不同。
	//strProtocol为[地址]的[协议]部分	
	//strHostName为[地址]的[主机名]部分
	//strHostName为[地址]的[域名]部分	
	//strWebAddress为[地址]的[网页地址]部分
	//isDefault为当前是默认视图。
	//HideItems 是需要隐藏地址栏网页列表。
	
	gURLBar  :function(){
		if(!gURLBar) var gURLBar = document.getElementById("urlbar");
		return gURLBar ;
	},	
	isfirstIn : false ,
	isEndIn : false ,
	isDefault:false ,
	strValue : "" ,
	strProtocol : document.createElementNS("http://www.w3.org/1999/xhtml", "span"),
	highSecurity :  document.createElementNS("http://www.w3.org/1999/xhtml", "span"),
	strHostName : document.createElementNS("http://www.w3.org/1999/xhtml", "span"),
	strDomainName : document.createElementNS("http://www.w3.org/1999/xhtml", "span"),
	strWebAddress : document.createElementNS("http://www.w3.org/1999/xhtml", "span") ,
	
	HideItems :[
		{name : "Google toolbar New Page" ,	value : "chrome://google-toolbar/content/new-tab.html" },
		{name : "tracer" ,	value : "chrome://tracer/content/tracer.xul" },		
		{name : "Jump Start" ,	value : "chrome://jumpstart/content/tabView.xul" }
	],	
	
	/* 对显示的结果进行设计初始值 */
	defaultSet: function() {	
		gURLBar.emptyText="";	
		const nsIDOMNSEditableElement = Components.interfaces.nsIDOMNSEditableElement;
		gURLBarInputBox =gURLBar.inputField.QueryInterface(nsIDOMNSEditableElement).editor.rootElement;		
		this.strHostName.style.color="#7b7c7d" ;
		this.strHostName.appendChild (document.createTextNode(""));	
		this.strProtocol.style.color="#7b7c7d" ;
		this.strProtocol.appendChild (document.createTextNode(""));
		this.highSecurity.style.color="#000000" ;
		this.highSecurity.appendChild (document.createTextNode(""));		
		this.strDomainName.style.color="#000000" ;
		this.strDomainName.appendChild (document.createTextNode(""));
		this.strWebAddress.style.color="#7b7c7d" ;
		this.strWebAddress.appendChild (document.createTextNode(""));
		this.setUrlBarEvent() ;
	},	

	/*对地栏显示效果设置触发事件。 */	
	setUrlBarEvent : function() {		
		//地址栏的value 更改时，触发。	
		var self =this ;		
		//self.strValue = gURLBar.value;
		self.strValue =gBrowser.currentURI.spec ;
		gURLBar.__defineSetter__("value", function(val) {
			if (!self.pageHide(val) )
				self.strValue = val;				
			this.mIgnoreInput = true;
			if (this.focused) 
				self.defaultStyle();
			else
				self.myStyle();
			this.mIgnoreInput = false;
			var event = document.createEvent("Events");
			event.initEvent("ValueChange", true, true);
			this.inputField.dispatchEvent(event);
			return val;			
		});
		
		gURLBar.__defineGetter__("value", function() {
			self.setUrlbarEmpty() ;
			return this.focused ? this.inputField.value : self.strValue;
		});
		
		/*鼠标移动到地栏上的效果 */
		var myInputBox=document.getElementById("myInputBox",gURLBar) ;
		if(!myInputBox) myInputBox=gURLBar ;
		myInputBox.setAttribute("onmouseover","myFirefoxUrlBar.UrlBoxHover()") ;
		myInputBox.setAttribute("onmouseout", "myFirefoxUrlBar.UrlBoxMsOut()") ;

		/*使用键盘上的ctrl+L 键,或点新标签时触发*/		
		gURLBar.inputField.addEventListener("focus", function() {
			if(!self.isfirstIn){
				self.isfirstIn=true ;
				self.isEndIn=true ;
				self.defaultStyle();
			}
			if(self.isEndIn) {
				self.setUrlbarEmpty() ;
			}
		}, false);	
		
		/*地址栏失去焦点时触发，这个真是难搞呀！ 想了我整整三天三夜,搞到晚上3点半,真是晕死。 
			firefox本身的blur非常的莫名其妙 */	
		gURLBar.addEventListener("blur", function() {																	
			if(self.isEndIn) {
				self.strValue = gURLBar.inputField.value ;
				self.myStyle();
				self.isEndIn=false ;	
				self.isfirstIn=false ;
			}
		}, false);	
		
		/*主要是判断是否是在地址栏中第一次按鼠标*/			
		gURLBar.addEventListener("mousedown", function() {
			if(this.hasAttribute("focused")){
				self.isfirstIn=false ;						
			}
			else{
				self.isfirstIn=true ;
				self.isEndIn=false ;
			}
			if(!self.isDefault){
				self.defaultStyle();
				self.isDefault=true ;	
			}
		}, false);	
		
		/*主要是判断是否已进入地址栏。与上面的函数结合，解决Blur失效的Bug */					
		gURLBar.addEventListener("click", function() {
			if(self.isfirstIn){ 
				self.isEndIn=true ;
				focusAndSelectUrlBar() ;
			}
		}, false);	
	},
	
	/* 判断是否隐藏当前地址 */
	pageHide : function(val){
		for (var i=0 ;i<this.HideItems.length ;i++){
			var hideItme=this.HideItems[i].value;
			if(hideItme==val){
				this.strValue ="" ;
				return true ;				
			}
		}
		return false ;
	},
	
	/*设置地址址栏是否为空 */
	setUrlbarEmpty : function() {
		var uc=document.getElementById("urlbar-container");
		if (gURLBar.inputField.value.length==0)	uc.setAttribute("empty","true") ;
		else uc.setAttribute("empty","false") ;
	},
	
	/*鼠标移到地址栏之上时 */
	UrlBoxHover: function(){
		if (!gURLBar.focused) this.defaultStyle();
	},
	
	/*鼠标移出地址栏时	 */
	UrlBoxMsOut: function(){
		if (!gURLBar.focused) this.myStyle();
	},	
	
	/*IE8.0的地址栏的栏式 */
	myStyle: function() {
		if (!/^(.+?:\/\/(?:[^\/]+@)?)([^\/]+)(.*)$/.test(this.strValue)) {
			this.defaultStyle();
			return;
		}
		while (gURLBarInputBox.hasChildNodes())
			gURLBarInputBox.removeChild (gURLBarInputBox.lastChild);
			
		if(RegExp.$1=="https://"){
			this.highSecurity.replaceChild (document.createTextNode("https"),this.highSecurity.firstChild) ;
			gURLBarInputBox.appendChild (this.highSecurity) ;			
			this.strProtocol.replaceChild (document.createTextNode("://"),this.strProtocol.firstChild) ;
			gURLBarInputBox.appendChild (this.strProtocol) ;			
		}
		else {
			this.strProtocol.replaceChild (document.createTextNode(RegExp.$1),this.strProtocol.firstChild) ;
			gURLBarInputBox.appendChild (this.strProtocol) ;				
		}
		if (RegExp.$3 != "/") {
			this.strWebAddress.replaceChild (document.createTextNode(RegExp.$3),this.strWebAddress.firstChild) ;
		}
		else {
			this.strWebAddress.replaceChild (document.createTextNode("/"),this.strWebAddress.firstChild);
		}
		var myHost=RegExp.$2 ;
		var patrnIp=/\d+\.\d+\.\d+\.\d+/; 
		try {
			var patrnDomain=null;
			var HostParts=null ;					
			if (!patrnIp.exec(myHost)) {
				if(/.+\.[a-zA-Z][a-zA-Z][a-zA-Z].[a-zA-Z][a-zA-Z]$/.exec(myHost)){
					HostParts= myHost.match(/(.+\.)(.+\.\w\w\w\.\w\w)$/);	
				}
				else if(/.+\.[a-zA-Z][a-zA-Z][a-zA-Z]$/.exec(myHost)){
					HostParts= myHost.match(/(.+\.)(.+\.\w\w\w)$/);					
				}				
				else{
					if(/.+\.[a-zA-Z][a-zA-Z]$/.exec(myHost)){
						if(/.+\..+\.[a-zA-Z][a-zA-Z].[a-zA-Z][a-zA-Z]$/.exec(myHost)){
							HostParts= myHost.match(/(.+\.)(.+\.\w\w\.\w\w)$/);					
						}
						else HostParts= myHost.match(/(.+\.)(.+\.\w\w)$/);					
					}
				}
			}
			if(HostParts!=null ){
				this.strHostName.replaceChild (document.createTextNode(HostParts[1]),this.strHostName.firstChild);
				gURLBarInputBox.appendChild (this.strHostName) ;				
				this.strDomainName.replaceChild (document.createTextNode(HostParts[2]),this.strDomainName.firstChild);
				gURLBarInputBox.appendChild (this.strDomainName) ;				
			}
			else {
				this.strDomainName.replaceChild (document.createTextNode(myHost),this.strDomainName.firstChild);
				gURLBarInputBox.appendChild (this.strDomainName) ;
			}
		}
		catch (e){
			alert(e) ;
		}
		gURLBarInputBox.appendChild (this.strWebAddress) ;
		this.isDefault=false ;			
	},
	
	/*firefox地址栏默认样式 */
	defaultStyle: function() {
		while (gURLBarInputBox.hasChildNodes()) gURLBarInputBox.removeChild (gURLBarInputBox.lastChild);
		if (!this.strValue) gURLBar.inputField.value = " ";			
		gURLBar.inputField.value = this.strValue;
		this.isDefault=true ;	
	},

	/* 当第一次加载本JS文件时执行*/
	firstLoad :function(){
		if (!gURLBar.focused) this.myStyle();
		this.setUrlbarEmpty() ;
		gURLBar.setAttribute("myFirefoxUrlbar","true")
	},
	 
	/* 当更改了工具栏的模式时执行 */
	onCustomizeToolbar :function(){
		document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", function(e) {
			if (e.attrName == "disabled" && !e.newValue)
				myFirefoxUrlBar.defaultSet();
				myFirefoxUrlBar.firstLoad() ;
				myFirefoxUrlBar.setSecurityButton();
			}
		, false);
	},
	
	/*当按F11时执行*/
	onFullScreen :function(){
		var cmdFullScreen=document.getElementById("View:FullScreen") ;
		cmdFullScreen.setAttribute("oncommand",
		"BrowserFullScreen();myFirefoxUrlBar.setFullScreen();") ;
	},
	setFullScreen :function(){
		this.defaultSet();
		this.firstLoad();
	},
	/*锁头点击后对应的事件 */
	SecurityButtonCmd :function(event,button) {
		event.stopPropagation();
		var myPopup=document.getElementById("identity-popup");
		myPopup.popupBoxObject.setConsumeRollupEvent(Ci.nsIPopupBoxObject.ROLLUP_CONSUME);
		var _identityBox=document.getElementById("identity-box")
		gIdentityHandler.setPopupMessages(_identityBox.className);		
		myPopup=myPopup.cloneNode(true) ;
		var class="myTmpSecurityPanel";
		myPopup.hidden = false;
		myPopup.setAttribute('class',class) ;
		myPopup.setAttribute('onpopuphidden',"this.parentNode.removeChild(this)	");			
		button.parentNode.appendChild(myPopup)	
		myPopup.openPopup(button, 'after_end');
	},
	
	/*对地址栏的在不同加密网站下的颜色*/
	setUrlbarVerified:function() {
		var identityBox=document.getElementById('identity-box') ;		
		identityBox.addEventListener('DOMAttrModified',function(e){
			gURLBar.setAttribute("verified", this.className) ;
		},false);			
	},
	
	/*将状态栏的锁头移到地址栏中*/
	setSecurityButton :function() {	
		var SecurityButton=document.getElementById('security-button') ;		
		function setData(){
			var urlSecurityButton=document.getElementById('urlSecurity-button') ;			
			if(urlSecurityButton){
				SecurityButton.setAttribute('moz-collapsed', 'true');				
				urlSecurityButton.setAttribute('level',SecurityButton.getAttribute('level'));
				var label=SecurityButton.getAttribute('label');
				if(label.length >0) urlSecurityButton.setAttribute('label',label); 
				else urlSecurityButton.removeAttribute('label');
			}
			else{
				SecurityButton.setAttribute('moz-collapsed', 'false');
			}			
		}
		setData();
		SecurityButton.addEventListener('DOMAttrModified',function(e){
			setData();
		},false);	
	},
	
	/*对Feed按钮进行监听 */
	setFeedButton :function() {	
		var feedButton=document.getElementById('feed-button') ;	
		function setFeedButton(){
			var tabbarFeedButton=document.getElementById('myFeed-button') ;	
			var feeds = gBrowser.selectedBrowser.feeds;
			if(feeds){
				tabbarFeedButton.setAttribute('feeds','true');
			}
			else tabbarFeedButton.removeAttribute('feeds');	
		}
		setFeedButton();
		feedButton.addEventListener('DOMAttrModified',function(e){
			setFeedButton();
		},false);	
	},	
	
	/*加载需要运行的命令*/
	init : function(){
		this.defaultSet(); 	
		this.onCustomizeToolbar() ;
		this.setSecurityButton();
		this.setUrlbarVerified();
		this.firstLoad() ;	
		this.onFullScreen() ;
		this.setFeedButton() ;
	}
};
myFirefoxUrlBar.init(); 
