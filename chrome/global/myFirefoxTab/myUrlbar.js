//        ������
//��������Fly_world ��ơ� 
//���ο���Locationbar2 �����˼·,������������ȫ������ơ�
//�ڴ˶�Dao Gottwald��ʾ��л :)


var myFirefoxUrlBar = {
	// gURLBar Ϊ��ַ����
	// ������ڵ�ַ���е�һ�ΰ���ʱ��isfirstInΪtrue
	// ������ڵ�ַ���е�һ����ɵ��ʱ��isEndInΪtrue	
	// strValue �ǵ�ַ���н�Ҫ��ʾ��ֵ����ַ����value����ʾ���ݲ�ͬ��
	//strProtocolΪ[��ַ]��[Э��]����	
	//strHostNameΪ[��ַ]��[������]����
	//strHostNameΪ[��ַ]��[����]����	
	//strWebAddressΪ[��ַ]��[��ҳ��ַ]����
	//isDefaultΪ��ǰ��Ĭ����ͼ��
	//HideItems ����Ҫ���ص�ַ����ҳ�б�
	
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
	
	/* ����ʾ�Ľ��������Ƴ�ʼֵ */
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

	/*�Ե�����ʾЧ�����ô����¼��� */	
	setUrlBarEvent : function() {		
		//��ַ����value ����ʱ��������	
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
		
		/*����ƶ��������ϵ�Ч�� */
		var myInputBox=document.getElementById("myInputBox",gURLBar) ;
		if(!myInputBox) myInputBox=gURLBar ;
		myInputBox.setAttribute("onmouseover","myFirefoxUrlBar.UrlBoxHover()") ;
		myInputBox.setAttribute("onmouseout", "myFirefoxUrlBar.UrlBoxMsOut()") ;

		/*ʹ�ü����ϵ�ctrl+L ��,����±�ǩʱ����*/		
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
		
		/*��ַ��ʧȥ����ʱ��������������Ѹ�ѽ�� ����������������ҹ,�㵽����3���,���������� 
			firefox�����blur�ǳ���Ī������ */	
		gURLBar.addEventListener("blur", function() {																	
			if(self.isEndIn) {
				self.strValue = gURLBar.inputField.value ;
				self.myStyle();
				self.isEndIn=false ;	
				self.isfirstIn=false ;
			}
		}, false);	
		
		/*��Ҫ���ж��Ƿ����ڵ�ַ���е�һ�ΰ����*/			
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
		
		/*��Ҫ���ж��Ƿ��ѽ����ַ����������ĺ�����ϣ����BlurʧЧ��Bug */					
		gURLBar.addEventListener("click", function() {
			if(self.isfirstIn){ 
				self.isEndIn=true ;
				focusAndSelectUrlBar() ;
			}
		}, false);	
	},
	
	/* �ж��Ƿ����ص�ǰ��ַ */
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
	
	/*���õ�ַַ���Ƿ�Ϊ�� */
	setUrlbarEmpty : function() {
		var uc=document.getElementById("urlbar-container");
		if (gURLBar.inputField.value.length==0)	uc.setAttribute("empty","true") ;
		else uc.setAttribute("empty","false") ;
	},
	
	/*����Ƶ���ַ��֮��ʱ */
	UrlBoxHover: function(){
		if (!gURLBar.focused) this.defaultStyle();
	},
	
	/*����Ƴ���ַ��ʱ	 */
	UrlBoxMsOut: function(){
		if (!gURLBar.focused) this.myStyle();
	},	
	
	/*IE8.0�ĵ�ַ������ʽ */
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
	
	/*firefox��ַ��Ĭ����ʽ */
	defaultStyle: function() {
		while (gURLBarInputBox.hasChildNodes()) gURLBarInputBox.removeChild (gURLBarInputBox.lastChild);
		if (!this.strValue) gURLBar.inputField.value = " ";			
		gURLBar.inputField.value = this.strValue;
		this.isDefault=true ;	
	},

	/* ����һ�μ��ر�JS�ļ�ʱִ��*/
	firstLoad :function(){
		if (!gURLBar.focused) this.myStyle();
		this.setUrlbarEmpty() ;
		gURLBar.setAttribute("myFirefoxUrlbar","true")
	},
	 
	/* �������˹�������ģʽʱִ�� */
	onCustomizeToolbar :function(){
		document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", function(e) {
			if (e.attrName == "disabled" && !e.newValue)
				myFirefoxUrlBar.defaultSet();
				myFirefoxUrlBar.firstLoad() ;
				myFirefoxUrlBar.setSecurityButton();
			}
		, false);
	},
	
	/*����F11ʱִ��*/
	onFullScreen :function(){
		var cmdFullScreen=document.getElementById("View:FullScreen") ;
		cmdFullScreen.setAttribute("oncommand",
		"BrowserFullScreen();myFirefoxUrlBar.setFullScreen();") ;
	},
	setFullScreen :function(){
		this.defaultSet();
		this.firstLoad();
	},
	/*��ͷ������Ӧ���¼� */
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
	
	/*�Ե�ַ�����ڲ�ͬ������վ�µ���ɫ*/
	setUrlbarVerified:function() {
		var identityBox=document.getElementById('identity-box') ;		
		identityBox.addEventListener('DOMAttrModified',function(e){
			gURLBar.setAttribute("verified", this.className) ;
		},false);			
	},
	
	/*��״̬������ͷ�Ƶ���ַ����*/
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
	
	/*��Feed��ť���м��� */
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
	
	/*������Ҫ���е�����*/
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
