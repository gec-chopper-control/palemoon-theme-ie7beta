/*       ������
//��������Fly_world ��ơ�
//���ڶ�ѡ����pop���Զ���
//���еĺ��������Ѵ�ͷ�����д��
//ע�� �����ܲ�����Search menu���˼·���ڴ˱�ʾ��л��������ʵ�ֵ��㷨�ǲ�ͬ�ġ�


//isDragBegin����갴��ʱΪtrue
//isSelectOprate����갴�²����϶����ʱΪtrue.
//iFrame�ǻ��ʷ���Ĵ��ڡ�
//win����ʱ���õ��ĵ�ǰWindow
//doc�������õ���Window ��document
//minChar��Сȡ����
//searchImg������ͼƬ��
//selTextImg��ǰ���ڵ�SearchImage
//translateWords�ǵ�ǰ������Ҫ�������
//language��Ҫ������ֶ�Ӧ���ԡ�
//mySelPop�ǵ�SearchImage�������Ĳ˵���
*/
var mySelectText = {
	isDragBegin :null ,
	isSelectOprate :null ,
	win : null ,
	doc : null ,
	minChar :2 ,
	searchImg: null,
	selTextImg : null ,
	translateWords :null,
	language:null,
	mySelPop:null,
	myDicPop:null,
	savedLanguage:"myFirefoxTab.mySelectText.savedLanguage",
	saveAccelator:"myFirefoxTab.mySelectText.savedAccelator",
	Accelator:null,
	
	/*�õ��Ƿ�ʹ��searchMenu*/	
	getAccelator : function (){
		var isAccelator = null ;
		if (!gPrefService)
			gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
		  		.getService(Components.interfaces.nsIPrefBranch2);		
		try{
			isAccelator = gPrefService.getBoolPref(this.saveAccelator);
		} catch (e) {
			gPrefService.setBoolPref(this.saveAccelator,true);
			isAccelator=true;
		}
		if(isAccelator != null) this.Accelator=isAccelator;
	},
	
	/*�����Ƿ�ʹ��searchMenu*/
	saveAccelator : function (value){
		this.Accelator= value=='true' ? true : false ;
		gPrefService.setBoolPref(this.saveAccelator,this.Accelator);
		if(!this.Accelator){		
			if(this.doc){
				var myImg =this.doc.getElementById('myFxSearchImg');
				if(myImg) this.hideImage(myImg);
			}			
		}
		else{
			this.showSearchPanel() ;
		}
	},
	
	/*��ʼ��*/
	init :function(){
		var self=this ;
		self.getAccelator();
		panelContainer=gBrowser.mPanelContainer ;
		panelContainer.addEventListener("mousedown", mySelectText, false);	
		panelContainer.addEventListener("mouseup",mySelectText, false);			
		panelContainer.addEventListener("mousemove", mySelectText, false);			
		panelContainer.addEventListener("scroll", mySelectText, false);	
		panelContainer.addEventListener("dblclick", mySelectText, false);
		window.addEventListener("unload", function(event){	
			self.removeEvent();
		},false);			

	},
	removeEvent:function(){
		panelContainer=gBrowser.mPanelContainer ;
		panelContainer.removeEventListener("mousedown", mySelectText, false);	
		panelContainer.removeEventListener("mouseup",mySelectText, false);			
		panelContainer.removeEventListener("mousemove", mySelectText, false);			
		panelContainer.removeEventListener("scroll", mySelectText, false);	
		panelContainer.removeEventListener("dblclick", mySelectText, false);
	},
	
    handleEvent: function (event) {
		switch (event.type) {
			case "mousedown" :
				this.onBeginDrag(event);
				break;
			case "mouseup" :
				this.onEndDrag(event);
				break;			
			case "mousemove":
				this.onDraging(event);
				break;
			case "scroll":
				this.onScroll(event);
				break;		
			case "dblclick":
				this.onDblClick(event);
				break;	
		}
  },

	
	/*����ʱ������*/
	onScroll : function(aEvent){
		if(!this.Accelator) return ;
		if(aEvent.button == 2) return;		
		this.isDragBegin=false ;
		this.isSelectOprate=false ;
	},
	
    /*�����϶�״̬*/
	onBeginDrag : function(aEvent){
		if(aEvent.button == 2) return;	
		if(this.doc){
			var myImg =this.doc.getElementById('myFxSearchImg');
			if(myImg) this.hideImage(myImg);
		}
		if(!this.Accelator) return ;
		this.isDragBegin=true ;
	},
	
	/*�ƶ����ʱ�ı��С*/
	onDraging : function(aEvent){	
		if(aEvent.button == 2) return;
		if(!this.Accelator) return ;
		if(this.isDragBegin){
			this.isSelectOprate=true ;
		}
	},
		
	/*�����϶�״̬ */
	onEndDrag : function(aEvent){
		if(aEvent.button == 2) return;
		this.isDragBegin=false ;		
		if(this.isSelectOprate) this.showSearchPanel() ;
		this.isSelectOprate=false ;
	},
	
	onDblClick : function(aEvent){
		if(aEvent.button == 2) return;
		if(!this.Accelator) return ;		
		this.showSearchPanel() ;
	},
	
	/*����ѡ����ı�����һ���һ�����ֽڵ㣬��Ҫ�������ǣ��ںܶ��ʱ�� endContainer����Ч�ġ�
	  ��iframe��designMode����onʱ�������ڱ༭״̬�����ܳ���SerarchMenu.
	*/
	showSearchPanel : function(){
		this.win=document.commandDispatcher.focusedWindow ;
		var selection = this.win.getSelection();
		if(!selection) return ;
		if(selection.rangeCount>1) return;
		
		this.doc=this.win.document;
		if(this.doc.designMode=='on') return;

		var strSelection=selection.toString() ;
		this.translateWords= strSelection ;

		var selLen=strSelection.length;
		if (selLen < this.minChar){
			this.isSelectOprate=false ;
			return ;
		}	
		
		var anchorNode=selection.anchorNode,
		 anchorOffset=selection.anchorOffset,
		 range=selection.getRangeAt(selection.rangeCount-1),		
		 boxNode=range.commonAncestorContainer,
		 startNode=range.startContainer,
		 endNode=range.endContainer,
		 startOffset=range.startOffset,
		 endOffset=range.endOffset,
		 node =null ;

		if(boxNode.nodeValue) node=boxNode ;			
		if(!node && endOffset >0 && endNode.nodeValue) node =endNode;
		if(!node && startNode.nodeValue && startNode.nodeValue.indexOf(strSelection) >= 0 ) {
			node =startNode;
			endOffset=node.nodeValue.length ;
		}
		if(!node){			
			var imgList=boxNode.getElementsByTagName("IMG") ;
			for(var i=0 ;i<imgList.length ;i++){
				var img=imgList[i];
				if(img.alt) strSelection=strSelection.replace(img.alt,"");	
			}
		}			
		if(!node){
			if(endOffset=="00"){
				var preNode=endNode.previousSibling ;
				if(preNode) var findValue= this.getTextNode(preNode ,strSelection);
				if (findValue){
					node=findValue.node ;
					startOffset=findValue.startOffset;
					endOffset=findValue.endOffset ;
				}
			}
		}			
		if(!node){	
			var findValue= this.getTextNode(boxNode ,strSelection) ;
			if (findValue){
				node=findValue.node ;
				startOffset=findValue.startOffset;
				endOffset=findValue.endOffset ;
			}
		}
		
		if(node){
			var focusNode=selection.focusNode;
			var focusOffset=selection.focusOffset;					
			var endPoint=this.getFinalNode(node,startOffset,endOffset);	
			range=this.doc.createRange();	
			range.setStart(anchorNode,anchorOffset);
			range.setEnd(anchorNode,anchorOffset);
			selection.removeAllRanges();
			selection.addRange(range);
			selection.extend(focusNode,focusOffset);
			this.showSearchImageButton(endPoint) ;	
			this.getDictionary();		
		}
	},
	
	/*Ҳ���и��õķ����ɣ������һ�û�뵽*/
	/*�ڵ�ǰ�Ľڵ����ҵ�����ָ���ı����ı��ӽڵ�*/
	getTextNode :function(currentNode ,findStr){
		var findNode = null ;
		var strValue=this.getStrSel(findStr) ;

		//alert("begin search") ;				
		var subNode=currentNode.lastChild;
		while (subNode){
			if(subNode.textContent.length >0) {
				var subNodeType=subNode.nodeType;
				var findPos = this.isTextNode(subNodeType,subNode.textContent,strValue);
				if(findPos.isfind ){
					if(subNodeType==3) {
						findNode={"node":subNode ,"startOffset" : findPos.startOffset ,"endOffset" : findPos.endOffset}
						break ;
					}
					else subNode=subNode.lastChild;
				}
				else subNode=subNode.previousSibling;
			}
			else subNode=subNode.previousSibling;
		}
		//alert("end search find" ) ;	
		return findNode ;
	},
	
	/*ͨ����ǰ�����ѡ�����������ֵ�����ж��Ƿ�Ϊ������ϵ�������ؿ�ʼ�������ƫ�ơ�*/
	isTextNode	: function (subNodeType, nodeValue ,strValue){
		var isfind=false ;
		var startIndex =null ;
		var endIndex =null ;
		var findIndex=null ;
		var value=strValue.value ;
		var rows =strValue.rows ;
		
		nVal=this.getStrValue(nodeValue);
		if (nVal.length==0 ) return isfind;
		
		//alert(" subNodeType  =" + subNodeType+ "\n nval = " + nVal + "\n value = " + value) ;
		if(subNodeType != 3) {
			if( nVal.indexOf(value) >= 0) isfind=true ;	
			else if((findIndex = value.indexOf(nVal)) >= 0) {
				if(value.substr(value.length-nVal.length) ==nVal) 
					isfind=true;
			}			
		}
		else{
			if((findIndex = value.indexOf(nVal)) >=0) {
				if(value.substr(value.length-nVal.length) == nVal){
					startIndex =0 ;	
					isfind=true;			
				}
			}			
			else if( (findIndex = nVal.indexOf(value)) >= 0) {
				if(rows > 1 && nVal== value ){
					startIndex =0;
					isfind=true;
				}
				else if(rows == 1 && nVal.substr(nVal.length-value.length) ==value){
					startIndex =findIndex;
					isfind=true;					
				}
				else if((nVal.length-value.length)==findIndex){
					startIndex =findIndex;
					isfind=true;						
				}
			}
		}		
		var pos={"isfind" : isfind ,"startOffset": startIndex ,"endOffset": nodeValue.length} ;
		return pos ;
	},
	
	/*ת��������ı�*/
	getStrSel :function(strSel){
		var value=strSel;
		var strLines=value.split(/\n|\r/);
		var lineNo=strLines.length-1 ;
		var strValue=null ;
		if(lineNo ==0 ) strValue=this.getStrValue(value) ;
		else{
			while (lineNo>=0 && !strValue){  
				strValue=this.getStrValue(strLines[lineNo]) ;
				if(strValue.length >=1) break ; 
				lineNo-- ;
			}
		}
		return {"value" : strValue ,"rows" : strLines.length} ;
	},
	
	getStrValue : function(strSel){
		var value = strSel.replace(/^\s+/g, "")
			.replace(/^#/g, "")
			.replace(/^\*/g, "")
			.replace(/\s+/g, " ")
			.replace(/^\s+/, "")
			.replace(/\s+$/, "");
		return value ;	
	},

	/*�����ҵ����ı��ڵ㣬�ı���ʼλ�ã����ı�����λ�ã��õ���ʾpanel������ */
	/* myStr1��ѡ���ı��ĵ�һ���ַ���myStr1�����һ���ַ�*/
	getFinalNode:function(node,startOffset,endOffset){
		var myStr=[3];
		if(startOffset >= endOffset) startOffset = 0 ;
		var strNode=node.nodeValue ;
		myStr[0]= strNode.substr(0,endOffset-1);
		myStr[1]= strNode.substr(endOffset-1,1);
		myStr[2]= strNode.substr(endOffset);
		var styles=this.getStyleOverrides(node.parentNode);
		var myAllSpans=this.doc.createElement("span");	
		var mySpan=[] ;
		var len=myStr.length ;
		var myTextStyle="display:inline; float:none; position:static; margin:0 ;padding:0;";
		for(var i=0;i<len;i++){
			mySpan[i]=this.doc.createElement("span");
			mySpan[i].setAttribute("style",myTextStyle);
			this.overrideStyles(mySpan[i],styles);
			mySpan[i].appendChild(this.doc.createTextNode(myStr[i]));
			myAllSpans.appendChild(mySpan[i]);
		}
		myAllSpans.setAttribute("style",myTextStyle);
		node.parentNode.replaceChild(myAllSpans,node);
		var pos=this.findPos(mySpan[1]);
		var x=pos[0] + mySpan[1].getBoundingClientRect().width;
		var y=pos[1] + mySpan[1].getBoundingClientRect().height;
		myAllSpans.parentNode.replaceChild(node,myAllSpans);
		var endPoint={"x" : x, "y" : y } ;
		return endPoint ;
	},
	
	/*�������λ�õ���ϸ��Ϣ*/
	showMsg : function(node,startOffset ,endOffset ,endPoint ){
		var myDoc=window.top.getBrowser().selectedBrowser.contentDocument;
		var nodeValue=node.nodeValue ;
		var strMsg= " node =" + node.nodeValue +
			"\n startOffset =" +  startOffset  +	
			"\n endOffset =" +  endOffset  +							
			"\n endPoint.x =" + endPoint.x  +
			"\n endPoint.y =" + endPoint.y  +
			"\n leftValue =" + nodeValue.substr(0,startOffset) +	
			"\n starValue =" + nodeValue.substr(startOffset,1) +		
			"\n midValue =" + nodeValue.substr(startOffset+1,endOffset-startOffset-2) +	
			"\n endValue =" + nodeValue.substr(endOffset-1,1) +	
			"\n rightValue =" + nodeValue.substr(endOffset) +							
					"" ;
		var myMsg=myDoc.getElementById('mouseUpMsg') ;					
		if(myMsg) myMsg.innerHTML=strMsg ;
		alert(strMsg) ;	
	},
	
	/*��ʾ����ͼ��*/
	showSearchImageButton : function(endPoint){
		this.addSearchImageToPage() ;
		var myImg = this.selTextImg ;		
		this.showImage(myImg ,endPoint);
		if(!this.myDicPop) this.myDicPop=document.getElementById('myDicPanel');
	},
	
	/*��������ͼ��*/	
	hideImage : function(img) {
		img.setAttribute('hidden', 'true');
		img.style.display="none" ;
		img.style.left="";
		img.style.top="";
		img.parentNode.removeChild(img);
	},
	
	/*ȷ��ͼ���λ��,����ӵ�������������֮��ľ���*/		
	showImage :function(img ,endPoint) {
		img.style.left=endPoint.x + 3 + "px";
		img.style.top=endPoint.y + 3 +  "px";	
		if(img.hasAttribute('hidden')) img.removeAttribute('hidden');
		img.style.opacity="0.6" ;	
		img.style.display="-moz-box";
	},
    /*----------------------------------���µ��Ƕ�popup����-----------------------*/

	/*ҳ����û��SelectedTextImageʱ���� */
	addSearchImageToPage : function () {
		me=this;
		var myImg =this.doc.getElementById('myFxSearchImg');
		if(!myImg){	
			if(!this.searchImg){
				var Img = this.doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
				Img.setAttribute('id', 'myFxSearchImg');
				Img.setAttribute('hidden', 'true');			
				Img.setAttribute('width', '24');	
				Img.setAttribute('height', '24');
				Img.setAttribute('src', this.searchImageIcon);				
				Img.style.position="absolute" ;
				Img.style.zIndex="2147483647" ;
				Img.style.opacity="0.6" ;			
				Img.style.border="none" ;
				Img.style.display="none" ;
				Img.addEventListener('mouseover',function(event){
					this.style.opacity="1.0";
					if(event.ctrlKey) me.showDic(this);					
				}, false);
				Img.addEventListener('mousemove',function(event){
					this.style.opacity="1.0";
					if(event.ctrlKey) me.showDic(this);					
				}, false);				
				
				me=this;
				Img.addEventListener('mouseout',function(){this.style.opacity=this.getAttribute('open')?"1.0":"0.6";}, false);	
				Img.addEventListener('mousedown', function(event) {
					if(event.button == 2) return;
					if(!me.mySelPop) me.mySelPop=document.getElementById('mySelectSearchPop') ;
					var myPanel=me.mySelPop ;
					myPanel.popupBoxObject.openPopup(this, 'after_start', 0, 1, false, false);
					this.style.opacity="1.0";
					event.stopPropagation();
				}, false);
				this.searchImg=Img ;
			}
			myImg=this.searchImg ;
			if(this.doc && this.doc.body)	this.doc.body.appendChild(myImg);
		}
		else{
			var myImg =this.doc.getElementById('myFxSearchImg');
		}
		this.selTextImg= myImg ;
	},
	
	/*���������˵�*/
	bulidPopup : function (popup){
		var searchBar= document.getElementById('searchbar') ;
		var mySep = document.getElementById('mySelectSearchPopSep',popup);
		var firstItem= document.getElementById('mySelectSearchFirstItem',popup);		
		var engines = searchBar.engines;	
		var self=this ;
		var curEngine=searchBar.currentEngine ;
		firstItem.setAttribute('image',curEngine.iconURI.spec) ;
		firstItem.setAttribute('label',curEngine.name );		
		
		for (var i = 0; i < engines.length; i++) {
			var engineInfo = engines[i];
			if(curEngine!=engineInfo){
				var r = document.createElement('menuitem');
				r.setAttribute('label',engineInfo.name );
				r.setAttribute('image', engineInfo.iconURI.spec);
				r.setAttribute('index',i) ;
				r.addEventListener('command', function(event) {												   
					var searchBar=document.getElementById('searchbar');
					engine = searchBar.engines[this.getAttribute('index')];
					self.loadSearch(getBrowserSelection(),engine) ;
					event.stopPropagation() ;
				}, false); 
				popup.insertBefore(r , mySep);
			}
		}
		if(engines.length<=1) mySep.style.display="none";
		else mySep.style.display="-moz-box";

		var myImg =this.selTextImg ;
		myImg.setAttribute('open', 'true');
		myImg.style.opacity="1.0" ;
		this.movePanel("myGoogleDic");
	},
	
	/*�ر�popupʱ����ͼ��*/
	popupClosing : function(){
		var myImg =this.selTextImg ;
		if(myImg){
			myImg.style.opacity="0.6" ;
			myImg.removeAttribute('open');	
		}
	},
	
	/*ȥ���˵��еĲ˵���*/
	unBulidPopup : function(popup,event){
		if (event.target != popup) return ;
		var mySep = document.getElementById('mySelectSearchPopSep',popup);
		var m =mySep.previousSibling;
		while(m.tagName !='menuseparator'){
			popup.removeChild(m);
			m =mySep.previousSibling;
		}	
	},
	/*ִ�в˵��е�����*/
	loadSearch: function BrowserSearch_search(searchText,engine ) {	
		var submission = engine.getSubmission(searchText, null); 
		if (submission) gBrowser.loadOneTab(submission.uri.spec, null, null, submission.postData, null, false);
	},
	
	/*copy*/
	copyText:function(){
		var aCommand="cmd_copy";
		try {
			var controller = top.document.commandDispatcher.getControllerForCommand(aCommand);
			if (controller && controller.isCommandEnabled(aCommand))
			  controller.doCommand(aCommand);
		}
		catch (e) {
			dump("An error occurred executing the " + aCommand + " command\n" + e + "\n");
		}
	},

	/*�õ�ԭ�����CSS����ֵ*/
	getStyleOverrides:function(node){
		var computedStyle=this.doc.defaultView.getComputedStyle(node,"");		
		function getValue(property){return  computedStyle.getPropertyValue(property);	}
		var styles =[		
			{"property" :"font-size"		,	"name" : "fontSize"			,	"value" : ""  },
			{"property" :"font-weight"		,	"name" : "fontWeight"		,	"value" : ""  },			
			{"property" :"font-family"		,	"name" : "fontFamily"		,	"value" : ""  },	
			{"property" :"font-size-adjust"	,	"name" : "fontSizeAdjust"	,	"value" : ""  },			
			{"property" :"font-stretch"		,	"name" : "fontStretch"		,	"value" : ""  },	
			{"property" :"font-style"		,	"name" : "fontStyle"		,	"value" : ""  },				
			{"property" :"font-variant"		,	"name" : "fontVariant"		,	"value" : ""  },		
			{"property" :"line-height"		,	"name" : "lineHeight"		,	"value" : ""  },				
			{"property" :"text-align"		,	"name" : "textAlign"		,	"value" : ""  },		
			{"property" :"text-decoration"	,	"name" : "textDecoration"	,	"value" : ""  },	
			{"property" :"text-indent"		,	"name" : "textIndent"		,	"value" : ""  },				
			{"property" :"text-shadow"		,	"name" : "textShadow"		,	"value" : ""  },		
			{"property" :"text-transform"	,	"name" : "textTransform"	,	"value" : ""  },				
			{"property" :"word-spacing"		,	"name" : "wordSpacing"		,	"value" : ""  }
		] ;		
		for (var i =0 ;i< styles.length ;i++){
			var s= styles[i] ;
			var val= getValue(s.property) ;
			if(val) s.value = val ;
		}		
		return styles;
	},
	
	/*�Ե�ǰ���������ö�Ӧ��CSS*/
	overrideStyles:function(node,styles){
		if(typeof node.style!="undefined"){
			for(var i=0;i<styles.length;i++){
				var s =styles[i];
				node.style[s.name]=s.value;
			}
		}
	},
	
	/*�ҵ���ǰbox�ľ��Զ�λ*/
	findPos:function(obj){
		var curleft=0,curtop=0;
		if(obj.offsetParent){
			curleft=obj.offsetLeft;
			curtop=obj.offsetTop;
			while((obj=obj.offsetParent)){
				curleft+=obj.offsetLeft;
				curtop+=obj.offsetTop;
			}
		}
		return[curleft,curtop];
	},
	
	/*----------------------------��������ʾgoogle dictionary---------------------*/
	
	/*ֱ����ʾgoogle dictionary */
	showDic :function(imgButton){		
		if(this.myDicPop.state=='open') return;
		if(!this.mySelPop) this.mySelPop=document.getElementById('mySelectSearchPop') ;
		if(this.mySelPop.state=='open')  return;		
		this.movePanel("mainPopupSet");			
		this.myDicPop.openPopup(imgButton,'after_start',0,2,false,false);
	},
	
	/*���ʵ䴰���Ƶ���ͬ��λ�� */	
	movePanel:function(nodeId){
		var popup=this.myDicPop;
		if(popup.parentNode.id != nodeId) document.getElementById(nodeId).appendChild(popup)
	},	
	
	/*�õ���ѡ�����ݵ�google url*/
	getDictionary : function(){
		var strSel=this.getStrValue(this.translateWords);
		strSel=strSel.replace(/\s/g, "+");
		this.getLanguage() ;
		var src="http://www.google.com/dictionary?aq=f&langpair="
			+this.language
			+"&q="
			+strSel
			+"&hl=en";
		this.buildIframe(src);
	},
	
	/*�򵯳��˵�������iframe,���ڷ���*/
	buildIframe:function(src){
		var frame= document.createElement('iframe');
		frame.setAttribute('flex','1');
		frame.setAttribute('style','margin:4px;');		
		frame.hidden=true;
		frame.addEventListener("load", function (event){
			var doc = event.originalTarget;
			mySelectText.addDicCss(doc);
			this.hidden=false;
		}, true);
		frame.setAttribute('src',src);
		var myDicBox=document.getElementById('myDicBox');
		if(myDicBox.firstChild) myDicBox.removeChild(myDicBox.firstChild);
		myDicBox.appendChild(frame);		
	},

	/*ȡ����ǰѡ�����������*/
	getLanguage:function(){
		if(this.language) return ;
		var dic=null ;
		try {
			dic = gPrefService.getCharPref(this.savedLanguage);
		} catch(e) {
			dic = "en|en" ;
		}		
		this.language=dic ;	
	},
	/*���浱ǰ����������*/
	saveLanguage:function(){
		gPrefService.setCharPref(this.savedLanguage,this.language);
	},
	/*ѡ�����Բ˵����*/
	updateLanguage:function(menuItem){		
		this.language=menuItem.value ;
		this.saveLanguage() ;
		this.getDictionary() ;
	},	
	/*��Dictionary�����Ӷ�Ӧ�Ĳ˵���*/
	addLanguage : function(menupopup){
		var language_code = {
'en':'English',
'ar':'Arabic',
'bn':'Bengali',
'bg':'Bulgarian',
'zh-CN':'Chinese (Simplified)',
'zh-TW':'Chinese (Traditional)',
'hr':'Croatian',
'cs':'Czech',
'nl':'Dutch',
'fi':'Finnish',
'fr':'French',
'de':'German',
'el':'Greek',
'gu':'Gujarati',
'iw':'Hebrew',
'hi':'Hindi',
'it':'Italian',
'kn':'Kannada',
'ko':'Korean',
'ml':'Malayalam',
'mr':'Marathi',
'pt':'Portuguese',
'ru':'Russian',
'sr':'Serbian',
'es':'Spanish',
'ta':'Tamil',
'te':'Telugu',
'th':'Thai',
		};
		
		var language_dict={
			en:"English",fr:"French",de:"German",it:"Italian",ko:"Korean",es:"Spanish",ru:"Russian","zh-TW":"Chinese (Traditional)","zh-CN":"Chinese (Simplified)",pt:"Portuese",hi:"Hindi"
		};
		var menuList="languageBox";
		var mp=menupopup;
		while(m=mp.lastChild) mp.removeChild(m);
		var language=language_code;	
		for(var n in language){
			var menu= document.createElement('menu');
			var l= language[n] ;			
			menu.setAttribute('label',l) ;			
			var menupopup=  document.createElement('menupopup');
			var value="en|" + n;	
			var label=l +" <> " + language.en;
			this.addMenuItem(menupopup ,label,value) ;			
			if(language_dict[n]){
				var value=n + "|" + n ;	
				var label=l + " Dictionary" ;
				this.addMenuItem(menupopup ,label,value) ;
			}
			menu.appendChild(menupopup);
			mp.appendChild(menu);
		}
	},
	
	addMenuItem: function(mp , label , value ){
		var m=  document.createElement('menuitem');
		m.setAttribute('label',label) ;		
		m.setAttribute('value',value) ;	
		m.setAttribute('type',"radio") ;
		if(value==this.language) m.setAttribute('checked',true) ;
		m.setAttribute('oncommand', "mySelectText.updateLanguage(this)" ) ;	
		mp.appendChild(m);			
	},
	/*��iframe�������Զ���Css*/
	addDicCss:function(myDoc){
		var head=myDoc.getElementsByTagName("head")[0];
		var style=myDoc.createElement("style");
		head.appendChild(style);
		var sheet=style.sheet;
		var h=function(node,value)	{
			var cssRule=node+"{"+value+"}";
			sheet.insertRule(cssRule,sheet.cssRules.length);
		};
		h("#cnt>.bt","background:white !important;");
		h("#wl-st-head,#wl-ust-head","float:right !important;position:absolute;top:5px; right:125px;");
		h(".wl-hd","float:right !important;position:absolute;top:4px; right:31px;");
		h(".wl-hd  IMG","display:none !important;");		
		h("#dct-clk-a","float:right !important;	position:absolute; top:5px; right:5px;");
		h(".dct-eh > .dct-tt ,.dct-em >.dct-tt ","display:block !important;margin-bottom:3px;");		
		h("#sd,#dct-clk-a>span ,.err","display:none !important;");		
		h("body","margin:0 !important;");
		h("h2","font-size:9pt !important; margin:0px 0 2px 0 !important ;line-height:15px !important;");
		h("h3","font-size:9pt !important;color:purple !important;text-shadow:1px 1px white; margin-top:-4px !important");		
		h("body #cnt","width:100% !important; min-width:0 !important;");
		h("p,dl,multicol","margin:1px 0 1px 0 !important;");
		h("div.dct-ec","margin:5px 0 2px 0 !important;line-height:15px !important;color:blue !important;");		
		h(".rt-sct-exst,.dct-rt-sct","width:100% !important;float:none; !important");
		h("li.dct-em","margin:5px 0 10px 18px !important;padding-left:0px !important;");
		h("li.dct-ee","margin:5px 0px 5px 0 !important;padding-left:0px !important;");
		h(".dct-srch-rslt","padding-top:0px !important;");		
		h(".dct-srch-rslt p,.dct-srch-rslt ul,.dct-srch-rslt ol","margin-left: 2px !important;");
		h(".rt-sct-exst .dct-srch-rslt","padding-right: 0px !important;");	
		h(".dct-er","margin: 0px !important;");			
		h(".dct-eh","font-size:9pt !important; margin:-2px 0 -2px 0 !important ;line-height:15px !important;");
		h(".dct-eh .dct-eh","color:red !important;");	
		h(".dct-e2 div","line-height:15px !important;");
		h("LI > SPAN","margin-left:0 !important;");	
		h(".mr-wds","margin:-5px 0 10px 0 !important;");			
		h(".dct-srch-rslt >p","display :none !important;");			
		h(".bt, h","border-top:none !important;padding:2px 0 2px 0 !important");
		
		h("#gbar","display:none !important;");
		h(".gbh","display:none !important;");
		h("#guser","display:none !important;");		
		h(".tb","display:none !important;");
		h("#dict-hist","display:none !important;");
	},	
	/*ѡ�����ݵ���ͼ�����״*/
	searchImageIcon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADPUlEQVR4nK2Vz4scRRTHP11VPbPZNSxETZAgiEZzi2AOXkTEvYriXfGcHEQiRFC8eZCYo7gHvYqCt1ySHFRU8h+IiYi/CKySmM26mdnZmX4/PFTP9Pb2rDJgQVNNd9f3861X770uDp+9dA44A5zg/x1fAetpqYwXLrz2LA+srhz4peO4Oe6OmeHuuBpmjpniZqg6bopZfn7zzvbJD65cP5OOrR6S1cPL/Y2hz1NuRM1QrWdTXAw1w1RRVUzyvahiajxy/9Jx4Hg60LVn1zNxM1wzxKwR1ClADRPN71VRjQB0AS3XztnTvYUC/9ZnP9aAsgtwBzdruYbFACpaA7wNmIXDHVPNB6i6kDiAiLTWpqm4qtaQHM8c88UBKoa6YdMdONn51PXrTy+3Frx39U/ujYTBzoTRWKgmkl2KYm588cbpNsCyuDENkZNjJjmH94/fbu2goqgIIvk71WbeP7aGE1b6EbU9Z6BqNaC74JNXH53df3fjLh9/+TvbI6nTs2vo5u0dYih4+MGVBmCqiAibg8mBsf32xibrV39luNuI2xyAOlQKG1sVAGEK+OPumM3t8Xzx65t8dOUXBjsTpBLOvXACFUXmAQgIEQu50IIDt/6ecG84pppUnQXf/HCHDy//nMVFefPFx1k7dRSpq3r/kCKisURDroBk5j4aT5CqQkU6Cy5e+ikfqBnnX3qCtVNHs1N1bE770tjDQ8Jjrwa4u1RCNalQ6R6yVIKqcf7lk6w9eawRclCKzveWelgssTRtFQ46BcxJu8vvPtO1CVx7/3kAnnr7GkdWl/BQ8tfI0dTHU6/ZgeNIpdnpnB3817BY4rGPhYSVBRZKPJVY6jU7EFGqShbuPWrZ8bYmjBJJCY8ZQNrTTUXqHcyp5H8bMRRYWmJIiVHiZZkBscTiDJAbndSF89w7X2OeM8TqgzQCVsQchpjqsGQR7/Xx2MPTVDzVV/3DcZpWoe6YZWEjF40Vca64pxJrCWdxYsJDhCJkwGBXyhgLHnvoPszzT0cpcAJWBCxEPGRAzu89V6gFY8KLhMeAFwEo0GokwEYS8U8//37jlSPLvd12hAtmdVQUredN+hetyffUxe2twSFg/R/tt6bdouIGuQAAAABJRU5ErkJggg%3D%3D",
}
mySelectText.init() ;
