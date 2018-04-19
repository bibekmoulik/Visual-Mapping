var clickedFlag = false ;
var flag = true ;
var idCounter, indentCount = 0 ;
var mappingSource, mappingTargetId, mappingSourceX, mappingSourceY, cPath = "";
var alreadyMarkedFlagsArray = [];
var mappingArray = [];
var inNameSpaceMap = new Object();
var outNameSpaceMap = new Object();
var finalNameSpaceMap = new Object();
var inputXMLDoc, outputXMLDoc;
var rawMapWindow, xslMapWindow, ESQLMapWindow;

//******************************************************************

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

/* **************************************************
******** Showing the Raw Mapping Table **************
************************************************** */
function showRawMapping()
{
	if(mappingArray.length == 0)
	{
		alert("Nothing has been mapped.\nPlease start mapping by connecting the nodes first.");
		return;
	}
	
	ascendingSort(mappingArray);
	var cStyle = "border:1px solid red; border-collapse:collapse; padding:8px;";
	var inHTML = '<table style="' + cStyle + '">';
	
	inHTML += '<tr style="' + cStyle + '">';
	inHTML += '<td style="' + cStyle + '">Source Element ID</td>';
	inHTML += '<td style="' + cStyle + '">Target Element ID</td>';
	inHTML += '<td style="' + cStyle + '">Mapping Connection ID</td></tr>';
	
	for(var i=0; i < mappingArray.length; i++)
	{
		inHTML += '<tr style="' + cStyle + '">';
		inHTML += '<td style="' + cStyle + '">' + mappingArray[i][0] + '</td>';
		inHTML += '<td style="' + cStyle + '">' + mappingArray[i][1] + '</td>';
		inHTML += '<td style="' + cStyle + '">' + mappingArray[i][2] + '</td></tr>';
	}
	inHTML += '</table>';
	
	if (rawMapWindow) {rawMapWindow.close();}
	rawMapWindow = window.open('', 'rawMapWindow', 'height=420px,width=750px,left=200px,top=100px,menubar=no,status=no,titlebar=no');
    rawMapWindow.document.write(inHTML);
}

/* **************************************************
*********** Showing the ESQL Code *******************
************************************************** */
function showESQLMapping()
{
	if(mappingArray.length == 0)
	{
		alert("Nothing has been mapped.\nPlease start mapping by connecting the nodes first.");
		return;
	}
	
	var sourcePath, targetPath;
	ascendingSort(mappingArray);
	
	var esqlHTML = '';
	
	for(var key in finalNameSpaceMap)
	{
		if(finalNameSpaceMap.hasOwnProperty(key))
		{
			esqlHTML += 'DECLARE ' + key + ' NAMESPACE "' + finalNameSpaceMap[key] + '";\n';
		}
	}
	
	esqlHTML += '\n';
	
	for(var i=0; i< mappingArray.length; i++)
	{
		sourcePath = document.getElementById(mappingArray[i][0]).className.replace(/\//g,'.').replace(/\[/g,'(XMLNSC.Attribute)').replace(/\]/g,'');
		targetPath = document.getElementById(mappingArray[i][1]).className.replace(/\//g,'.').replace(/\[/g,'(XMLNSC.Attribute)').replace(/\]/g,'');
		
		esqlHTML = esqlHTML + 'SET OutputRoot.XMLNSC'+ targetPath + ' = InputRoot.XMLNSC' + sourcePath + ';\n';
	}
	
	if (ESQLMapWindow) {ESQLMapWindow.close();}
	ESQLMapWindow = window.open('', 'ESQLMapWindow', 'height=420px,width=750px,left=200px,top=100px,menubar=no,status=no,titlebar=no');
    ESQLMapWindow.document.write('<p align="center"><textarea rows="25" cols="100" spellcheck="false" wrap="off" >' + esqlHTML + '</textarea></p>');
}

/* **************************************************
*********** Showing the XSLT Code *******************
************************************************** */
function createXSLT()
{
	if(mappingArray.length == 0)
	{
		alert("Nothing has been mapped.\nPlease start mapping by connecting the nodes first.");
		return;
	}
	
	ascendingSort(mappingArray);
	
	var xslNS = "http://www.w3.org/1999/XSL/Transform";
	var excludeNS = "xsl xsi";
	
	var styleSheetNode = document.createElementNS(xslNS,"xsl:stylesheet");
	styleSheetNode.setAttribute("version", "1.0");
	styleSheetNode.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
	
	for(var key in finalNameSpaceMap)
	{
		if(finalNameSpaceMap.hasOwnProperty(key))
		{
			styleSheetNode.setAttribute("xmlns:" + key, finalNameSpaceMap[key]);
			excludeNS += " " + key;
		}
	}
	
	styleSheetNode.setAttribute("exclude-result-prefixes", excludeNS);
	
	var outputNode = document.createElementNS(xslNS,"xsl:output");
	outputNode.setAttribute("method", "xml");
	outputNode.setAttribute("omit-xml-declaration", "yes");
	
	styleSheetNode.appendChild(outputNode);
	
	//************** XSLT Writing Logic *****************
	var templateNode = document.createElementNS(xslNS,"xsl:template");
	templateNode.setAttribute("match", "/");
	
	for(var i=0; i< mappingArray.length; i++)
	{
		targetElements = document.getElementById(mappingArray[i][1]).className.substring(1).split('/');
		var tempNode = templateNode;
		var objectType = "Element";
		
		for(var j=0; j<targetElements.length; j++)
		{
			if(targetElements[j].charAt(0) == '['){objectType = "Attribute";}
			
			var ns = "";
			var element = "";
			var nsKey = "";
			var nsVal = "";
			if(objectType == "Attribute")
			{
				if (targetElements[j].indexOf(':') > 0)
				{
					ns = targetElements[j].substring(1,targetElements[j].indexOf(':'));
					element = targetElements[j].substring(targetElements[j].indexOf(':')+1,targetElements[j].length-1);
				}
				else
				{
					element = targetElements[j].substring(1,targetElements[j].length-1);
				}
			}
			else
			{
				ns = targetElements[j].substring(0,targetElements[j].indexOf(':'));
				element = targetElements[j].substring(targetElements[j].indexOf(':')+1);
			}
			
			if (ns != "")
			{
				nsVal = finalNameSpaceMap[ns];
				
				for (nsKey in outNameSpaceMap)
				{
					if (outNameSpaceMap[nsKey] == nsVal){break;}
				}
				element = nsKey + ":" + element;
			}
			
			if (! tempNode.getElementsByTagName(element)[0])
			{
				var nodeElement;
				if(objectType == "Attribute")
				{
					nodeElement = document.createElementNS(xslNS,"xsl:attribute");

					nodeElement.setAttribute("name",element);
					
					if (ns != "")
					{
						nodeElement.setAttribute("xmlns:"+nsKey,nsVal);
					}
				}
				else
				{
					nodeElement = document.createElementNS(nsVal,element);
				}
				tempNode.appendChild(nodeElement);
				tempNode = nodeElement;
			}
			else
			{
				tempNode = tempNode.getElementsByTagName(element)[0];
			}
			
		}
		var valElement = document.createElementNS(xslNS,"xsl:value-of");
		valElement.setAttribute("select", document.getElementById(mappingArray[i][0]).className.replace(/[\[]/g,'@').replace(/[\]]/g,''));
		
		tempNode.appendChild(valElement);
	}
	styleSheetNode.appendChild(templateNode);
	
	var xslString = new XMLSerializer().serializeToString(styleSheetNode);
	
	if (xslMapWindow) {xslMapWindow.close();}
	xslMapWindow = window.open('', 'xslMapWindow', 'height=420px,width=750px,left=200px,top=100px,menubar=no,status=no,titlebar=no');
	xslMapWindow.document.write('<p align="center"><textarea rows="25" cols="100" spellcheck="false" wrap="off" >'+formatXml(formatXml(xslString))+'</textarea></p>');
}
