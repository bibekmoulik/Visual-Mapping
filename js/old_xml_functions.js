var flag= true ;
function xmlParsing_old(xmlString, docType)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		try
		{
			xmlDoc = parser.parseFromString(xmlString ,"text/xml");
			if(xmlDoc.getElementsByTagName("parsererror").length > 0 )
			{
				extractDOMErrorText_old(xmlDoc.getElementsByTagName("parsererror")[0].innerText, docType);
				xmlDoc = false ;
			}
		}
		catch(e)
		{
			alert("---------------\nInvalid "+docType+" :\n---------------\nError occured while parsing the "+docType);
			xmlDoc = false ;
		}
	}
	else
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString);
		if(xmlDoc.parseError.errorCode != 0 )
		{
			alert("Invalid" + docType +" : "+xmlDoc.parseError.reason+"\nLineNumber : "
			+xmlDoc.parseError.line+"\nPosition : "+xmlDoc.parseError.linepos);
			xmlDoc = false ;
		}
	}
	return xmlDoc;
}

function xmlParsingWithoutErr_old(xmlString)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		try
		{
			xmlDoc = parser.parseFromString(xmlString ,"text/xml");
			if(xmlDoc.getElementsByTagName("parsererror").length > 0 ){xmlDoc = false;}
		}
		catch(e)
		{
			xmlDoc = false ;
		}
	}
	else
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString); 
		if(xmlDoc.parseError.errorCode != 0 ){xmlDoc = false;}
	}
	return xmlDoc;
}

function formatTextArea_old(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}
	
	document.getElementById(textAreaId).value = formatXmlWithoutErr_old(formatXml_old(rawXmlData,docType)) ;
}

function formatXml_old(rawXmlData, docType) 
{
	var formattedXmlData = "" ;
	var indentCount = -1 ;
	var xmlDoc = xmlParsing_old(rawXmlData, docType);
	
	if(xmlDoc)
	{
		var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
		xmlDoc = xmlParsing_old(cleanedRawData, docType);
		formattedXmlData = funcIterate_old(xmlDoc, formattedXmlData,indentCount).substring(1);
	}
	else
	{
		formattedXmlData = rawXmlData;
	}
	
	return formattedXmlData ;
}

function formatXmlWithoutErr_old(rawXmlData) 
{
	var formattedXmlData = "" ;
	var indentCount = -1 ;
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsingWithoutErr_old(cleanedRawData);
	
	if(xmlDoc)
	{
		formattedXmlData = funcIterate_old(xmlDoc, formattedXmlData,indentCount).substring(1);
	}
	else
	{
		formattedXmlData = rawXmlData;
	}
	
	return formattedXmlData ;
}

function funcIterate_old(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		indentCount = indentCount + 1 ;
		outputXml += openingTag_old(currentItem,indentCount) ;
		if(currentItem.hasChildNodes())
		{	
			outputXml = funcIterate_old(currentItem,outputXml,indentCount) ;
		}
		else
		{
			outputXml += (currentItem.nodeValue || "").replace(/^\s+|\s+$/g, "");
			flag = false; 
		}
		outputXml += closingTag_old(currentItem,indentCount);
		indentCount = indentCount - 1 ;
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function closingTag_old(currentItem,indentCount)
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
			default : returnString ="\n"+padding_old(indentCount)+"</"+ currentItem.nodeName +">" ;
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

function openingTag_old(currentItem,indentCount)
{
	var returnString = "" ;
	switch(currentItem.nodeType)
	{
		case 4 : returnString = "\n"+padding_old(indentCount)+"<![CDATA[" ; break;
		case 8 : returnString = "\n"+padding_old(indentCount)+"<!--" ; break;
		case 7 : returnString ="\n"+padding_old(indentCount)+"<\?"+ currentItem.nodeName + " " ; break ;
		case 3 : returnString = "" ; break;
		default : returnString ="\n"+padding_old(indentCount)+"<"+ currentItem.nodeName + getAttributesNameValue_old(currentItem) +">" ;
	}
	return returnString ;
}

function getAttributesNameValue_old(currentItem)
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

function padding_old(indentCount)
{
	var resultString = "";
	var indentLevel = 3;
	for(var i=0; i<(indentCount*indentLevel); i++)
	{
		resultString += " " ;
	}
	return resultString ;
}

function deleteEmptyNodesFromTextArea_old(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var outputXml = "" ;
	var indentCount = -1 ;
	var docType;
	if (textAreaId == 'xsltData'){docType = 'XSLT';}
	else if(textAreaId == 'inputXmlData'){docType = 'XML';}
	
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing_old(cleanedRawData, docType);		
	if(xmlDoc)
	{
		outputXml += deleteEmptyNodes_old(xmlDoc, outputXml,indentCount).substring(1) ;
	}
	else
	{
		outputXml += rawXmlData ;
	}		
	document.getElementById(textAreaId).value = outputXml ;
}

function deleteEmptyNodes_old(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		if(currentItem.textContent != "")
		{
			indentCount = indentCount + 1 ;
			outputXml += openingTag_old(currentItem,indentCount) ;
			
			if(currentItem.hasChildNodes())
			{	
				outputXml = deleteEmptyNodes_old(currentItem,outputXml,indentCount) ;
			}
			else
			{
				outputXml += currentItem.nodeValue || "";
				flag = false; 
			}
			outputXml += closingTag_old(currentItem,indentCount);
			indentCount = indentCount - 1 ;
		}
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function deleteCommentsFromTextArea_old(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var outputXml = "" ;
	var indentCount = -1 ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}
	
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing_old(cleanedRawData, docType);		
	if(xmlDoc)
	{
		outputXml = deleteComments_old(xmlDoc, outputXml, indentCount).substring(1);
	}
	else
	{
		outputXml += rawXmlData;
	}
	document.getElementById(textAreaId).value = outputXml ;
}

function deleteComments_old(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		if(currentItem.nodeType != 8)
		{
			indentCount = indentCount + 1 ;
			outputXml += openingTag_old(currentItem,indentCount) ;
			if(currentItem.hasChildNodes())
			{	
				outputXml = deleteComments_old(currentItem,outputXml,indentCount) ;
			}
			else
			{
				outputXml += currentItem.nodeValue || "";
				flag = false; 
			}
			outputXml += closingTag_old(currentItem,indentCount);
			indentCount = indentCount - 1 ;
		}
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function extractDOMErrorText_old(errorText, docType)
{
	var tempText = errorText.substring(errorText.indexOf(":")+1);
	var mainErrorBody = tempText.substring(0, tempText.indexOf("\n"));
	var positionText = mainErrorBody.substring(0, mainErrorBody.indexOf(":"));
	var reasonText = mainErrorBody.substring(mainErrorBody.indexOf(":")+1);
	var alertText = "";
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Occurred While Parsing : "+ docType + "\n";
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Position :  " + positionText + "\n";
	alertText = alertText + "Error Reason  : " + reasonText;
	alert(alertText);
}

function makeLinearXML_old(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}

	document.getElementById(textAreaId).value = formatXmlWithoutErr_old(formatXml_old(rawXmlData,docType)).replace(/>\s*</g,"><");
}
