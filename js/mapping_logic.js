var clickedFlag = false ;
var flag = true ;
var idCounter, indentCount = 0 ;
var mappingSource, mappingTargetId, mappingSourceX, mappingSourceY, cPath = "";
var alreadyMarkedFlagsArray = [];
var mappingArray = [];
var inNameSpaceMap = new Object();
var finalNameSpaceMap = new Object();
var inputXMLDoc, outputXMLDoc;

//******************************************************************

function makeXMLTrees()
{
	makeXMLTree('sourceXML','inDiv','in');
	makeXMLTree('targetXML','outDiv','out');
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
