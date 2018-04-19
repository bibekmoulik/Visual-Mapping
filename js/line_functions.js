
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

function removeConnection(line)
{
	for(var x=0; x< mappingArray.length; x++)
	{
		var mapElement = mappingArray[x];
		if(mapElement[2] == line.id)
		{
			document.getElementById(mapElement[1]).innerHTML = document.getElementById(mapElement[1]).innerHTML.replace(String.fromCharCode(8855), String.fromCharCode(8853));
			mappingArray.splice(x, 1);
			break;
		}
	}	
	document.body.removeChild(line);
}
