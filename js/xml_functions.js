
function xmlParsing(xmlString)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xmlString ,"text/xml");
		//alert(xmlDoc.parseError.reason);
		//if(xmlDoc.getElementsByTagName("parsererror").length > 0 )
		//{
		//	extractDOMErrorText(xmlDoc.getElementsByTagName("parsererror")[0].innerText);
		//	xmlDoc = false ;
		//}
	}
	else
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString);
		//if(xmlDoc.parseError.errorCode != 0 )
		//{
		//	alert("Invalid XML : " + xmlDoc.parseError.reason + "\nLineNumber : "
		//	+xmlDoc.parseError.line+"\nPosition : "+xmlDoc.parseError.linepos);
		//	xmlDoc = false ;
		//}
	}
	return xmlDoc;
}

function formatXml(rawXmlData) 
{
	var formattedXmlData = "" ;
	var indentCount = -1 ;				
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	xmlDoc = xmlParsing(cleanedRawData);
	formattedXmlData = funcFormatIterate(xmlDoc, formattedXmlData, indentCount).substring(1);
	return formattedXmlData ;
}

function funcFormatIterate(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		indentCount = indentCount + 1 ;
		outputXml += openingTag(currentItem,indentCount) ;
		if(currentItem.hasChildNodes())
		{	
			outputXml = funcFormatIterate(currentItem,outputXml,indentCount) ;
		}
		else
		{
			outputXml += (currentItem.nodeValue || "").replace(/^\s+|\s+$/g, "");
			flag = false; 
		}
		outputXml += closingTag(currentItem,indentCount);
		indentCount = indentCount - 1 ;
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function closingTag(currentItem,indentCount)
{
	var returnString = "" ;
	if(flag)
	{
		switch(currentItem.nodeType)
		{
			case 4 : returnString = "]]>" ; break;
			case 8 : returnString = "-->" ; break;
			case 7 : returnString = "?>" ; break;
			case 3 : returnString = "" ; break;
			default : returnString ="\n"+padding(indentCount)+"</"+ currentItem.nodeName +">" ;
		}
	}
	else
	{
		switch(currentItem.nodeType)
		{
			case 4 : returnString = "]]>"; flag = true ; break;
			case 8 : returnString = "-->" ; flag = true ; break;
			case 7 : returnString = " ?>" ; flag = true ; break;
			case 3 : returnString = "" ; break;
			default : returnString ="</"+ currentItem.nodeName +">" ; flag = true ;
		}
	}
	return returnString ;
}

function openingTag(currentItem,indentCount)
{
	var returnString = "" ;
	switch(currentItem.nodeType)
	{
		case 4 : returnString = "\n"+padding(indentCount)+"<![CDATA[" ; break;
		case 8 : returnString = "\n"+padding(indentCount)+"<!--" ; break;
		case 7 : returnString ="\n"+padding(indentCount)+"<\?"+ currentItem.nodeName + " " ; break ;
		case 3 : returnString = "" ; break;
		default : returnString ="\n"+padding(indentCount)+"<"+ currentItem.nodeName + getAttributes(currentItem) +">" ;
	}
	return returnString ;
}

function getAttributes(currentItem)
{
	var resultString = "";
	var attributeList = currentItem.attributes ;
	if(attributeList)
	{
		for(var i=0; i<attributeList.length; i++)
		{
			resultString += " " + attributeList[i].name + "=\"" + attributeList[i].value + "\"" ;
		}
	}
	return resultString ;
}

function padding(indentCount)
{
	var resultString = "";
	for(var i=0; i<(indentCount*3); i++)
	{
		resultString += " " ;
	}
	return resultString ;
}

function deleteTextNodes(item)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		if(currentItem.hasChildNodes())
		{
			currentItem = deleteTextNodes(currentItem) ;
		}
		else if(currentItem.nodeType == 3)
		{
			currentItem.textContent = null;
		}
		currentItem = currentItem.nextSibling ;
	}
	return item ;
}
