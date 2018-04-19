
function makeXMLTrees()
{
	var inSourceElement		= document.getElementById('sourceXML');
	var outSourceElement	= document.getElementById('inDiv');
	var cSourceType = 'in';
					
	var rawSourceXmlData = inSourceElement.value ;
	outSourceElement.innerHTML = '';
	
	var inTargetElement		= document.getElementById('targetXML');
	var outTargetElement	= document.getElementById('outDiv');
	var cTargetType = 'out';
					
	var rawTargetXmlData = inTargetElement.value ;
	outTargetElement.innerHTML = '';
	
	if (xmlParsing_old(rawSourceXmlData,'Source XML') && xmlParsing_old(rawTargetXmlData,'Target XML'))
	{
		if(createXMLTree(rawSourceXmlData,outSourceElement,cSourceType) && createXMLTree(rawTargetXmlData,outTargetElement,cTargetType))
		{	
			inSourceElement.style.display = 'none';
			outSourceElement.style.display = 'block';
			
			inTargetElement.style.display = 'none';
			outTargetElement.style.display = 'block';
			
			var buttonElement = document.getElementById("changeButton");
			if(buttonElement)
			{
				buttonElement.value = "Show Raw XMLs" ;
				buttonElement.onclick = function() {showRawXMLs();}
			}
			idCounter = 0 ;
			
			var mapButtons = document.getElementsByClassName("map-button");
			for(var i=0; i<mapButtons.length; i++)
			{
				mapButtons[i].style.visibility = "visible";
			}
			
			var xmlButtons = document.getElementsByClassName("xml-button");
			for(var i=0; i<xmlButtons.length; i++)
			{
				xmlButtons[i].disabled = true;
			}
		}
	}
}

function createXMLTree(rawXmlData, OutElement, cType) 
{
	var result = true ;
	var outputXml = "" ;
	var indentCount = -1 ;
	
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing(cleanedRawData);
	
	var withoutComments = deleteComments_old(xmlDoc, outputXml, indentCount).substring(1);
	cleanedRawData = withoutComments.replace(/>\s*</g,"><").replace(/\n/g,"");
	xmlDoc = xmlParsing(cleanedRawData);
	
	xmlDoc = deleteTextNodes(xmlDoc);
	
	if(xmlDoc)
	{
		if(cType.toUpperCase() == 'IN')
		{
			inputXMLDoc = xmlDoc;
		}
		else
		{
			outputXMLDoc = xmlDoc;
		}
		idCounter = 1;
		cPath = '';
		OutElement.appendChild(funcIterate(xmlDoc,cType, cPath));
		alreadyMarkedFlagsArray = [];
	}
	else
	{
		return false;
	}
	return result;
	
}

function funcIterate(item, cType, cPath)
{
	var currentItem = item.firstChild ;
	var parentTableElement, arrestRow, fertileRow, fertileTd, appenderCount, childCounter, numerator, denominator;;
	parentTableElement = document.createElement("table");
	parentTableElement.id = cType + '_parent_table_id_' + idCounter;
	while(currentItem)
	{
		//************************ Populating the Elements ************************
		arrestRow = document.createElement('tr');
		arrestRow.id = cType + '_arrest_row_id_' + idCounter;
		
		var arrestTable = document.createElement('table');
		var valueRow = document.createElement('tr');
		
		var indentBlock = getIndentBlocks(currentItem, 'Element');
		
		valueRow.innerHTML = indentBlock.innerHTML;
		valueRow.appendChild(getCollapsibleBlock(currentItem, idCounter, cType));
		
		cPath = cPath + "/" + generalizeNSName(currentItem);
		if(cType.toUpperCase() == 'IN')
		{
			valueRow.appendChild(getElementName(currentItem));
			valueRow.appendChild(createMapElementTd(cPath, idCounter, cType));
		}
		else
		{
			valueRow.appendChild(createMapElementTd(cPath, idCounter, cType));
			valueRow.appendChild(getElementName(currentItem));
		}
		
		arrestTable.appendChild(valueRow);
		
		arrestRow.appendChild(arrestTable);
		parentTableElement.appendChild(arrestRow);
		
		//************************ Populating the Attributes ************************
		var attributeList = currentItem.attributes ;
		if(attributeList.length > 0)
		{
			var attributeRow = document.createElement('tr');
			attributeRow.id = cType + '#_attribute_row_id_' + idCounter;
			
			var attributeTd = document.createElement('td');
			var attributeTable = getAttributesTable(currentItem,attributeList,cType,cPath);
			
			attributeTd.appendChild(attributeTable);
			attributeRow.appendChild(attributeTd);
			parentTableElement.appendChild(attributeRow);
		} 
		
		//************************ Populating the Child Elements ************************
		fertileRow = document.createElement('tr');
		fertileRow.id = cType + '_fertile_row_id_' + idCounter;
		
		if(currentItem.hasChildNodes() && currentItem.lastChild.nodeType == 1)
		{
			appenderCount = (currentItem.childElementCount).toString().length;
			idCounter = idCounter + '.' + '0'.repeat(appenderCount-1) + '1';
			indentCount = indentCount + 1;
			fertileTd = document.createElement('td');
			fertileTd.id = cType + '_fertile_td_id_' + idCounter;
			fertileTd.appendChild(funcIterate(currentItem, cType, cPath));
			fertileRow.appendChild(fertileTd);
			parentTableElement.appendChild(fertileRow);
			indentCount = indentCount - 1;
			idCounter = idCounter.substring(0,idCounter.lastIndexOf('.'));
		}
		
		childCounter = idCounter.substring(idCounter.lastIndexOf('.')+1);		
		numerator = parseInt(childCounter) + 1;
		denominator = parseInt('1'+'0'.repeat(childCounter.length));
		quotient = (numerator/denominator).toString().substring(2);
		idCounter = idCounter.substring(0, idCounter.lastIndexOf('.')+1) + quotient + '0'.repeat(childCounter.length - quotient.length);
		
		cPath = cPath.slice(0, cPath.lastIndexOf('/'));
		currentItem = currentItem.nextSibling;
	}
	return parentTableElement;
}

function showRawXMLs()
{
	var inElement, outElement;
	
	var connectionLines = document.getElementsByClassName("stable");
	for(var i = connectionLines.length; i > 0; i--)
	{
		removeConnection(connectionLines[i-1]);
	}
	
	mappingArray.splice(0,mappingArray.length);
	
	inElement	= document.getElementById('sourceXML');
	outElement	= document.getElementById('inDiv');
	
	outElement.style.display = 'none';
	inElement.style.display = 'block';
	outElement.innerHTML = '';
	
	inElement	= document.getElementById('targetXML');
	outElement	= document.getElementById('outDiv');
	
	outElement.style.display = 'none';
	inElement.style.display = 'block';
	outElement.innerHTML = '';
	
	var buttonElement = document.getElementById("changeButton");
	if(buttonElement)
	{
		buttonElement.value = "Make XML Trees" ;
		buttonElement.onclick = function() {makeXMLTrees();}
	}
	
	inputXMLDoc = null;
	outputXMLDoc = null;
	
	var mapButtons = document.getElementsByClassName("map-button");
	for(var i=0; i<mapButtons.length; i++)
	{
		mapButtons[i].style.visibility = "hidden";
	}
	
	var xmlButtons = document.getElementsByClassName("xml-button");
	for(var i=0; i<xmlButtons.length; i++)
	{
		xmlButtons[i].disabled = false;
	}
}

function generalizeNSName(currentItem)
{
	var ndName = currentItem.nodeName;
	var ns = ndName.substring(0, ndName.indexOf(':'));
	var el = ndName.substring(ndName.indexOf(':')+1);
	if(Object.keys(finalNameSpaceMap).length == 0)
	{
		inNameSpaceMap[ns] = '';
		finalNameSpaceMap['NS0'] = '';
		ns = 'NS0';
	}
	
	if(ns.length != 0)
	{
		for(var key in finalNameSpaceMap)
		{
			if(finalNameSpaceMap.hasOwnProperty(key) && (finalNameSpaceMap[key] == inNameSpaceMap[ns]))
			{
				ns = key;
				break;
			}
		}
		ns = ns + ':';
	}
	return ns + el;
}

function addNameSpace(attributeObject, cType)
{
	var result = false;
	if(cType.toUpperCase() == 'IN')
	{
		inNameSpaceMap[attributeObject.name.substring(6)] = attributeObject.value;
		var nsFound = false;
		for(var key in finalNameSpaceMap)
		{
			if(finalNameSpaceMap.hasOwnProperty(key) && (finalNameSpaceMap[key] == ''))
			{
				nsFound = true;
				finalNameSpaceMap[key] = attributeObject.value;
				break;
			}
			
			if(finalNameSpaceMap.hasOwnProperty(key) && (finalNameSpaceMap[key] == attributeObject.value))
			{
				nsFound = true;
				break;
			}
		}
		if(nsFound == false)
		{
			result = 'NS'+(Object.keys(finalNameSpaceMap).length);
			finalNameSpaceMap[result] = attributeObject.value;
		}
	}
	
	if(cType.toUpperCase() == 'OUT')
	{
		outNameSpaceMap[attributeObject.name.substring(6)] = attributeObject.value;
		var nsFound = false;
		for(var key in finalNameSpaceMap)
		{
			if(finalNameSpaceMap.hasOwnProperty(key) && (finalNameSpaceMap[key] == ''))
			{
				nsFound = true;
				finalNameSpaceMap[key] = attributeObject.value;
				break;
			}
			
			if(finalNameSpaceMap.hasOwnProperty(key) && (finalNameSpaceMap[key] == attributeObject.value))
			{
				nsFound = true;
				break;
			}
		}
		if(nsFound == false)
		{
			result = 'NS'+(Object.keys(finalNameSpaceMap).length);
			finalNameSpaceMap[result] = attributeObject.value;
		}
	}
	return result;
}

function getAttributesTable(currentItem, attributeList, cType, cLocalPath)
{
	var attributeTable = document.createElement('table');
	
	var indentBlock = getIndentBlocks(currentItem, 'Attribute');
	
	for(var i=0; i<attributeList.length; i++)
	{
		var attributeValueRow = document.createElement('tr');
		attributeValueRow.innerHTML = indentBlock.innerHTML;
		if(currentItem.nextSibling)
		{
			attributeValueRow.appendChild(getLinkBlock(1));
		}
		else if(currentItem.parentElement)
		{
			attributeValueRow.appendChild(getLinkBlock(4));
		}
		attributeValueRow.appendChild(getAttributeLinkBranchBlock(attributeList,i));
		var cAttributePath = cLocalPath + "/[" + generalizeNSName(attributeList[i]) + "]" ;
		var cAttributeId = idCounter + ".#_attribute_" + (i+1) ;
		if(cType.toUpperCase() == 'IN')
		{
			attributeValueRow.appendChild(getAttributesNameValueVisual(attributeList[i],cType));
			if(attributeList[i].name.substring(0,5).toUpperCase() != "XMLNS")
			{
				attributeValueRow.appendChild(createMapElementTd(cAttributePath, cAttributeId, cType));
			}
		}
		else
		{
			if(attributeList[i].name.substring(0,5).toUpperCase() != "XMLNS")
			{
				attributeValueRow.appendChild(createMapElementTd(cAttributePath, cAttributeId, cType));
			}
			attributeValueRow.appendChild(getAttributesNameValueVisual(attributeList[i],cType));
		}
		attributeTable.appendChild(attributeValueRow);
	}
	return attributeTable;
}

function getAttributesNameValueVisual(attributeObject,cType)
{
	resultTdElement = document.createElement('td');	
	
	if(attributeObject.name)
	{
		if(attributeObject.name.substring(0,5).toUpperCase() == "XMLNS")
		{
			textElement = document.createTextNode(String.fromCharCode(160) + attributeObject.name.substring(6) + String.fromCharCode(160));
			resultTdElement.appendChild(textElement);				
			resultTdElement.title = "NameSpace Declaration : '" + attributeObject.value + "'";
			resultTdElement.className = 'nameSpace';		
			var resultNS = addNameSpace(attributeObject, cType);
			if(resultNS)
			{
				attributeObject.name = 'xmlns:'+resultNS;
			}
		}
		else
		{
			textElement = document.createTextNode(String.fromCharCode(160) + attributeObject.name + String.fromCharCode(160));
			resultTdElement.appendChild(textElement);				
			resultTdElement.title = "It is an Attribute [Sample Value : '" + attributeObject.value + "']";
			resultTdElement.className = 'attribute';
		}
	}
	
	return resultTdElement;
}
			
function extractDOMErrorText(errorText)
{
	var tempText = errorText.substring(errorText.indexOf(":")+1);
	var mainErrorBody = tempText.substring(0, tempText.indexOf("\n"));
	var positionText = mainErrorBody.substring(0, mainErrorBody.indexOf(":"));
	var reasonText = mainErrorBody.substring(mainErrorBody.indexOf(":")+1);
	var alertText = "";
	alertText += "-------------------------------------------\n";
	alertText += "Error Occurred While Parsing XML :\n";
	alertText += "-------------------------------------------\n";
	alertText += "Error Position :  " + positionText + "\n";
	alertText += "Error Reason  : " + reasonText;
	alert(alertText);
}

function toggleVisibility(idCounter,cType)
{
	var isFirstTag = true ;
	var fertileRowElement = document.getElementById(cType+'_fertile_row_id_'+idCounter);
	var attributeRowElement = document.getElementById(cType+'#_attribute_row_id_'+idCounter);
	
	var collapsibleBlock  = document.getElementById(cType+'_collapsible_block_id_'+idCounter);
	
	if(fertileRowElement)
	{
		if(fertileRowElement.style.display == 'none')
		{
			fertileRowElement.style.display = 'block';
			collapsibleBlock.innerHTML = collapsibleBlock.innerHTML.replace('+','-');
		}
		else
		{
			fertileRowElement.style.display = 'none';
			collapsibleBlock.innerHTML = collapsibleBlock.innerHTML.replace('-','+');
		}
	}
	
	if(attributeRowElement)
	{
		if(attributeRowElement.style.display == 'none')
		{
			attributeRowElement.style.display = 'block';
			collapsibleBlock.innerHTML = collapsibleBlock.innerHTML.replace('+','-');
		}
		else
		{
			attributeRowElement.style.display = 'none';
			collapsibleBlock.innerHTML = collapsibleBlock.innerHTML.replace('-','+');
		}
	}
	toggleConnectionCollapse(idCounter,cType);
}

function createMapElementTd(cPath, id, cType)
{	
	var textElement, tdElement;
	if (cType.toUpperCase() == 'IN')
	{
		textElement = document.createTextNode(String.fromCharCode(8853)); //65515
		tdElement = document.createElement('td');
		tdElement.className = cPath;
		tdElement.id = cType + '_map_id_' + id;
		tdElement.title = 'click & drag me to map as source';
		tdElement.style.cursor = 'pointer';
		tdElement.style.display = 'block';
		tdElement.onmousedown = function(event) {setSource(event,cType,id)};
	}
	else
	{
		textElement = document.createTextNode(String.fromCharCode(8853));	
		tdElement = document.createElement('td');
		tdElement.className = cPath;
		tdElement.id = cType + '_map_id_' + id;
		tdElement.title = 'drag & drop a source here to map with this target';
		tdElement.style.cursor = 'pointer';
		tdElement.style.display = 'block';
		//tdElement.onmouseup = function(event) {setTarget(event,cType,id)};
	}	
	
	tdElement.appendChild(textElement);
	return tdElement;
}


function getLinkBranchBlock(currentItem, alreadyMarkedFlag)
{
	var resultTdElement = document.createElement('td');
	
	if(currentItem && currentItem.nextSibling)
	{
		if(alreadyMarkedFlag == true)
		{
			resultTdElement = getLinkBlock(1);
		}
		else
		{
			resultTdElement = getLinkBlock(2);
		}
	}
	else
	{
		if (alreadyMarkedFlag != true)
		{
			resultTdElement = getLinkBlock(3);
		}
		else
		{
			resultTdElement = getLinkBlock(4);
		}
	}
	
	return resultTdElement;
}

function getAttributeLinkBranchBlock(attributeList, index)
{
	var resultTdElement = document.createElement('td');
	
	if(attributeList[index+1] || ((attributeList[index].ownerElement.lastChild) && (attributeList[index].ownerElement.lastChild.nodeType == 1)))
	{
		resultTdElement = getLinkBlock(2);
	}
	else
	{
		resultTdElement = getLinkBlock(3);
	}
	
	return resultTdElement;
}

function getLinkBlock(pattern)
{
	var resultTdElement = document.createElement('td');
	
	var tableElement = document.createElement('table');
	tableElement.className = 'branchLink';
	
	var upperTrElement = document.createElement('tr');
	var lowerTrElement = document.createElement('tr');
	
	var upperLeftTdElement = document.createElement('td');
	var upperRightTdElement = document.createElement('td');
	var lowerLeftTdElement = document.createElement('td');
	var lowerRightTdElement = document.createElement('td');
	
	switch(pattern)
	{
		case 1 :
				upperRightTdElement.style.borderLeft	= '1px solid red';
				lowerRightTdElement.style.borderLeft	= '1px solid red';
				break;
		case 2 :
				upperRightTdElement.style.borderLeft	= '1px solid red';
				upperRightTdElement.style.borderBottom	= '1px solid red';
				lowerRightTdElement.style.borderLeft	= '1px solid red';
				break;
		case 3 :
				upperRightTdElement.style.borderLeft	= '1px solid red';
				upperRightTdElement.style.borderBottom	= '1px solid red';
				break;
	}
	
	upperTrElement.appendChild(upperLeftTdElement);
	upperTrElement.appendChild(upperRightTdElement);
	lowerTrElement.appendChild(lowerLeftTdElement);
	lowerTrElement.appendChild(lowerRightTdElement);
	
	tableElement.appendChild(upperTrElement);
	tableElement.appendChild(lowerTrElement);
	resultTdElement.appendChild(tableElement);
	
	return resultTdElement;
}

function getElementName(currentItem)
{
	resultTdElement = document.createElement('td');
	textElement = document.createTextNode(String.fromCharCode(160) + currentItem.nodeName + String.fromCharCode(160));
	resultTdElement.appendChild(textElement);
	return resultTdElement;
}

function getCollapsibleBlock(currentItem, idCounter, cType)
{
	resultTdElement = document.createElement('td');
	if((currentItem.hasChildNodes() && currentItem.lastChild.nodeType == 1) || currentItem.hasAttributes())
	{
		resultTdElement.id = cType + '_collapsible_block_id_' + idCounter;
		textElement = document.createTextNode(String.fromCharCode(160) + '[-]' + String.fromCharCode(160));
		resultTdElement.appendChild(textElement);
		resultTdElement.onclick = function() {toggleVisibility(idCounter,cType);} 
	}
	return resultTdElement;
}

function getIndentBlocks(currentItem, itemType)
{
	var iLimit = (itemType == 'Element')?0:1 ;
	var valueRow = document.createElement('tr');
		
	var linkBlocksArray = [];
	var tempCurrentItem = currentItem;
	for(var i=0; i<indentCount; i++)
	{
		linkBlocksArray[i] = getLinkBranchBlock(tempCurrentItem,alreadyMarkedFlagsArray[i]);
		alreadyMarkedFlagsArray[i+1] = true;
		alreadyMarkedFlagsArray[i] = false;
		tempCurrentItem = tempCurrentItem.parentNode;
	}

	for(var i=indentCount; i > iLimit; i--)
	{
		valueRow.appendChild(linkBlocksArray[i-1]);
	}
	return valueRow;
}

function getOffsetSum(elem)
{
	var top=0, left=0;
	while(elem)
	{
		top = top + parseInt(elem.offsetTop);
		left = left + parseInt(elem.offsetLeft);
		elem = elem.offsetParent;
	}
	return {top: top, left: left}
}


function toggleConnectionCollapse(idCounter,cType)
{
	var sourceId,targetId,lineId,mapTdPosition,newLineSourceX,newLineSourceY,newLineTargetX,newLineTargetY,newLine,mapId,pathId;
	
	for(var i=0; i< mappingArray.length; i++)
	{
		sourceId = mappingArray[i][0];
		targetId = mappingArray[i][1];
		lineId = mappingArray[i][2];
		document.body.removeChild(document.getElementById(lineId));
					
		while(true)
		{
			temp = getOffsetSum(document.getElementById(sourceId));
			if(temp.left == 0 && temp.top == 0)
			{
				sourceId = sourceId.substring(0, sourceId.lastIndexOf('.'));
			}
			else
			{
				break;
			}
		}
		
		mapTdPosition = getOffsetSum(document.getElementById(sourceId));
		newLineSourceX = mapTdPosition.left + 7;
		newLineSourceY = mapTdPosition.top + 10;
		
		while(true)
		{
			temp = getOffsetSum(document.getElementById(targetId));
			if(temp.left == 0 && temp.top == 0)
			{
				targetId = targetId.substring(0, targetId.lastIndexOf('.'));
			}
			else
			{
				break;
			}
		}
		
		mapTdPosition = getOffsetSum(document.getElementById(targetId));
		newLineTargetX = mapTdPosition.left + 7;
		newLineTargetY = mapTdPosition.top + 10;
		
		lineId = 'connection_line['+sourceId+','+targetId+']';
		
		newLine = createLine(newLineSourceX,newLineSourceY,newLineTargetX,newLineTargetY,lineId);
		newLine.className = 'stable';
		document.body.appendChild(newLine);
		mappingArray[i][2] = lineId;
	}
}
