var clickedFlag = false ;
var flag = true ;
var idCounter, indentCount = 0 ;
var mappingSource, mappingTargetId, mappingSourceX, mappingSourceY, cPath = "";
var alreadyMarkedFlagsArray = [];
var mappingArray = [];
var inNameSpaceMap = new Object();
var finalNameSpaceMap = new Object();
var inputXMLDoc, outputXMLDoc;

function createLineElement(x, y, length, angle, id) {
    var line = document.createElement("div");
    var styles = 'border-bottom: 1px solid black; '
               + 'width: ' + (length-1) + 'px; '
               + 'height: 0px; '
			   + 'text-align:center; '
			   + 'cursor: pointer; '
               + '-moz-transform: rotate(' + angle + 'rad); '
               + '-webkit-transform: rotate(' + angle + 'rad); '
               + '-o-transform: rotate(' + angle + 'rad); '  
               + '-ms-transform: rotate(' + angle + 'rad); '  
               + 'position: absolute; '
               + 'top: ' + y + 'px; '
               + 'left: ' + x + 'px; ';
    line.setAttribute('style', styles);
	
	/*textElement = document.createTextNode(String.fromCharCode(215));
	//textElement.onclick = 
	textElement.onmouseover = function() {this.style.fontSize = '200%';};
	textElement.onmouseout = function() {this.style.fontSize = '100%';};
	line.appendChild(textElement);*/
	
	line.id = id;
	line.title = String.fromCharCode(183)+' Click to use a mapping function\n'+String.fromCharCode(183)+' Double-Click to remove this connection';
	
	line.onmouseover = function() {this.style.borderBottom = '3px solid red';};
	line.onmouseout = function() {this.style.borderBottom = '1px solid black';};
	//line.onmousedown = function() {if(!clickedFlag){useFunction();}};// {alert("Right-click menu goes here");};
	line.ondblclick = function() {removeConnection(this)};
    return line;
}

function useFunction()
{
	var functionTextBox = prompt("Please enter the function", "Function(Source X-path)");
    
    if (functionTextBox != null) {
        alert("Hello " + functionTextBox + "! How are you today?");
    }
}

function createLine(x1, y1, x2, y2, id) {
    var a = x1 - x2,
        b = y1 - y2,
        c = Math.sqrt(a * a + b * b);

    var sx = (x1 + x2) / 2,
        sy = (y1 + y2) / 2;

    var x = sx - c / 2,
        y = sy;

    var alpha = Math.PI - Math.atan2(-b, a);

    return createLineElement(x, y, c, alpha, id);
}

//******************************************************************
function mouseUpFunc(mouseUpEvent)
{
	if((clickedFlag) && (mouseUpEvent.target.id.substring(0,11).toUpperCase() == 'OUT_MAP_ID_'))
	{
		if(mouseUpEvent.target.innerHTML.includes(String.fromCharCode(8855)))
		{
			alert("Ooopss..!!\nTarget is already mapped..\nCannot be mapped again..\n");
		}
		else
		{
			mappingSourceId = mappingSource.id;
			mappingTargetId = mouseUpEvent.target.id;
			var lineId = 'connection_line['+mappingSourceId+','+mappingTargetId+']';
			
			var targetPosition = getOffsetSum(mouseUpEvent.target);
			targetPositionX = targetPosition.left + 7;
			targetPositionY = targetPosition.top + 10;
			
			var line = createLine(mappingSourceX,mappingSourceY,targetPositionX,targetPositionY,lineId);
			line.className = 'stable';
			document.body.appendChild(line);
			
			var mapItem = [mappingSourceId,mappingTargetId,lineId];			
			mappingArray[mappingArray.length] = mapItem;
			
			mouseUpEvent.target.innerHTML = mouseUpEvent.target.innerHTML.replace(String.fromCharCode(8853), String.fromCharCode(8855));
		}
	}
	clickedFlag = false ;
	mappingSourceX = 0;
	mappingSourceY = 0 ;
	var unstableLine = document.getElementById("unstable");
	if(unstableLine)
	{
		document.body.removeChild(unstableLine);
	}
}

function mouseMoveFunc(mouseMoveEvent)
{
	if(clickedFlag)
	{
		var unstableLine = document.getElementById("unstable");
		if(unstableLine)
		{
			document.body.removeChild(unstableLine);
		}
		var line = createLine(mappingSourceX,mappingSourceY,mouseMoveEvent.pageX,mouseMoveEvent.pageY, 'unstable');
		document.body.appendChild(line);
	}
}

function xmlParsing(xmlString)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xmlString ,"text/xml");
		//alert(xmlDoc.parseError.reason);
		if(xmlDoc.getElementsByTagName("parsererror").length > 0 )
		{
			extractDOMErrorText(xmlDoc.getElementsByTagName("parsererror")[0].innerText);
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
			alert("Invalid XML : "+xmlDoc.parseError.reason+"\nLineNumber : "
			+xmlDoc.parseError.line+"\nPosition : "+xmlDoc.parseError.linepos);
			xmlDoc = false ;
		}
	}
	return xmlDoc;
}

function makeXMLTree(inElementId,outElementId,cType)
{
	var inElement	= document.getElementById(inElementId);
	var outElement	= document.getElementById(outElementId);
					
	var rawXmlData = inElement.value ;
	outElement.innerHTML = '';
	
	if(createXMLTree(rawXmlData,outElement,cType))
	{	
		inElement.style.display = 'none';
		outElement.style.display = 'block';
		
		var buttonElement = document.getElementById(outElementId + "Button");
		buttonElement.value = "Show Raw XML" ;
		buttonElement.onclick = function() {showRawXML(inElementId,outElementId,cType);}
		
		idCounter = 0 ;
	}
}

function showRawXML(inElementId,outElementId,cType)
{
	var inElement	= document.getElementById(inElementId);
	var outElement	= document.getElementById(outElementId);
	
	var buttonElement = document.getElementById(outElementId + "Button");
	buttonElement.value = "Make XML Tree" ;
	buttonElement.onclick = function() {makeXMLTree(inElementId,outElementId,cType);}
	
	outElement.style.display = 'none';
	inElement.style.display = 'block';
	
	var connectionLines = document.getElementsByClassName("stable");
	for(var i=0; i< connectionLines.length; i++)
	{
		removeConnection(connectionLines[i]);
	}
	mappingArray.splice(0,mappingArray.length);
	if(cType.toUpperCase() == 'IN')
	{
		inputXMLDoc = null;
	}
	else
	{
		outputXMLDoc = null;
	}
	outElement.innerHTML = '';
}

function createXMLTree(rawXmlData, OutElement, cType) 
{
	var result = true ;
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing(cleanedRawData);
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
			attributeRow.id = cType + '_attribute_row_id_' + idCounter;
			
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
		var cAttributePath = cLocalPath + "/[" + attributeList[i].localName + "]" ;
		var cAttributeId = idCounter + "._attribute_" + (i+1) ;
		if(cType.toUpperCase() == 'IN')
		{
			attributeValueRow.appendChild(getAttributesNameValue(attributeList[i],cType));
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
			attributeValueRow.appendChild(getAttributesNameValue(attributeList[i],cType));
		}
		attributeTable.appendChild(attributeValueRow);
	}
	return attributeTable;
}

function getAttributesNameValue(attributeObject,cType)
{
	resultTdElement = document.createElement('td');	
	
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
			//inputXMLDoc.documentElement.innerHTML = inputXMLDoc.documentElement.innerHTML.replace('<'+attributeObject.name.substring(6)+':','<'+resultNS+':');
		}
	}
	else
	{
		textElement = document.createTextNode(String.fromCharCode(160) + attributeObject.name + String.fromCharCode(160));
		resultTdElement.appendChild(textElement);				
		resultTdElement.title = "It is an Attribute [Sample Value : '" + attributeObject.value + "']";
		resultTdElement.className = 'attribute';
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
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Occurred While Parsing XML :\n";
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Position :  " + positionText + "\n";
	alertText = alertText + "Error Reason  : " + reasonText;
	alert(alertText);
}

function toggleVisibility(idCounter,cType)
{
	var isFirstTag = true ;
	var fertileRowElement = document.getElementById(cType+'_fertile_row_id_'+idCounter);
	var attributeRowElement = document.getElementById(cType+'_attribute_row_id_'+idCounter);
	
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

function setSource(mouseDownEvent,cType,id)
{
	clickedFlag = true;
	var position = getOffsetSum(mouseDownEvent.srcElement);
	mappingSourceX = position.left + 7;
	mappingSourceY = position.top + 10;
	mappingSource = mouseDownEvent.srcElement;
	
	var line = createLine(mappingSourceX,mappingSourceY,mappingSourceX,mappingSourceY, 'unstable');
	document.body.appendChild(line);
}

function getLinkBranchBlock(currentItem, alreadyMarkedFlag)
{
	var resultTdElement = document.createElement('td');
	
	if(currentItem.nextSibling)
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
	
	if(attributeList[index+1] || (attributeList[index].ownerElement.lastChild.nodeType == 1))
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

function showRawMapping()
{
	document.getElementById('pdhurr').innerHTML = '';
	ascendingSort(mappingArray);
	var inHTML = '<table>';
	for(var i=0; i< mappingArray.length; i++)
	{
		inHTML = inHTML + '<tr><td style="border:1px solid red;">' + mappingArray[i][0] + '</td><td style="border:1px solid red;">' + mappingArray[i][1] + '</td><td style="border:1px solid red;">' + mappingArray[i][2] + '</td></tr>';
	}
	document.getElementById('pdhurr').innerHTML = inHTML + '</table>';
}

function showESQLMapping()
{
	var sourcePath, targetPath;
	document.getElementById('pdhurr').innerHTML = '';
	ascendingSort(mappingArray);
	var esqlHTML = '';
	for(var i=0; i< mappingArray.length; i++)
	{
		sourcePath = document.getElementById(mappingArray[i][0]).className.replace(/\//g,'.').replace(/\[/g,'(XMLNSC.Attribute)').replace(/\]/g,'');
		targetPath = document.getElementById(mappingArray[i][1]).className.replace(/\//g,'.').replace(/\[/g,'(XMLNSC.Attribute)').replace(/\]/g,'');
		
		esqlHTML = esqlHTML + 'SET OutputRoot.XMLNSC'+ targetPath + ' = InputRoot.XMLNSC' + sourcePath + ';\n';
	}
	var ESQLMapWindow = window.open('', 'ESQLMapWindow', 'height=420px,width=750px,left=200px,top=100px,menubar=no,status=no,titlebar=no');
    ESQLMapWindow.document.write('<p align="center"><textarea rows="25" cols="100" spellcheck="false" wrap="off" >'+esqlHTML+'</textarea></p>');
}

function ascendingSort(mappingArray)
{
	for (var i = 0; i < mappingArray.length; ++i)
    {
        for (var j = i + 1; j < mappingArray.length; ++j)
        {
			if (mappingArray[i][1] > mappingArray[j][1])
            {
                var a =  mappingArray[i];
                mappingArray[i] = mappingArray[j];
                mappingArray[j] = a;
            }
        }
    }
}

function removeConnection(line)
{
	for(var i=0; i< mappingArray.length; i++)
	{
		var mapElement = mappingArray[i];
		if(mapElement[2] == line.id)
		{
			document.getElementById(mapElement[1]).innerHTML = document.getElementById(mapElement[1]).innerHTML.replace(String.fromCharCode(8855), String.fromCharCode(8853));
			mappingArray.splice(i, 1);
			break;
		}
	}	
	document.body.removeChild(line);
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
	return result;
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

function createXSLT()
{
	ascendingSort(mappingArray);
	var xslString = '';
	xslString += '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
	for(var key in finalNameSpaceMap)
	{
		if(finalNameSpaceMap.hasOwnProperty(key))
		{
			xslString += ' xmlns:'+key+'="'+finalNameSpaceMap[key]+'"';
		}
	}
	
	xslString += '><xsl:output method="xml" omit-xml-declaration="yes"/>';
	xslString += '<xsl:template match="/">';
	
	//************** XSLT Writing Logic *****************
	for(var i=0; i< mappingArray.length; i++)
	{
		targetElements = document.getElementById(mappingArray[i][1]).className.substring(1).split('/');
		var tempNode = outputXMLDoc;
		//var attrFlag = false;
		for(var j=0; j<targetElements.length; j++)
		{
			if(targetElements[j].charAt(0) == '[')
			{
				var ns = targetElements[j-1].substring(0,targetElements[j-1].indexOf(':'));
				var tagName = targetElements[j-1].substring(targetElements[j-1].indexOf(':')+1);
				
				//tempNode = 	tempNode.getElementsByTagName(tagName)[0];
				//attrFlag = true;
				//tempNode.attributes = null;
				while(tempNode.attributes.length > 0)
				{
					tempNode.removeAttribute(tempNode.attributes[0].name);
				}
			
				var attr = document.createElement("xsl:attribute");
				attr.setAttribute("name", targetElements[j].substring(1,targetElements[j].length-1));
				if(ns.length >0){attr.setAttribute("namespace", ns);}
				tempNode.appendChild(attr);
				tempNode = attr;
				//tempNode = 	tempNode.getAttribute(targetElements[j].replace(/[\[\]]/g,''));
			}
			else
			{
				var ns = targetElements[j].substring(0,targetElements[j].indexOf(':'));
				var tagName = targetElements[j].substring(targetElements[j].indexOf(':')+1);
				
				tempNode = 	tempNode.getElementsByTagName(tagName)[0];
			}
		}
		
		var sourceLink = document.createTextNode('<xsl:value-of select="' + document.getElementById(mappingArray[i][0]).className.replace(/[\[]/g,'@').replace(/[\]]/g,'') + '"/>');
		tempNode.textContent = null;
		tempNode.appendChild(sourceLink);
	}
	
	xslString += new XMLSerializer().serializeToString(outputXMLDoc.documentElement);
	
	xslString += '</xsl:template></xsl:stylesheet>';
	//alert(xslString);	formatXml(xslString)
	
	var xslMapWindow = window.open('', 'xslMapWindow', 'height=420px,width=750px,left=200px,top=100px,menubar=no,status=no,titlebar=no');
    xslMapWindow.document.write('<p align="center"><textarea rows="25" cols="100" spellcheck="false" wrap="off" >'+formatXml(xslString)+'</textarea></p>');
}

