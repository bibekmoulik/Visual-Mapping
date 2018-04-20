var ajaxUrl = "https://bibekmoulik.github.io/Visual-Mapping/images/loading.gif";

function ajaxMakeXMLTrees()
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			//document.getElementById("loading-screen").innerText = msg;
			makeXMLTrees();
		}
    });
}

function ajaxShowRawXMLs()
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			showRawXMLs();
		}
    });
}

function ajaxFormatTextArea_old(textAreaId)
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			formatTextArea_old(textAreaId);
		}
    });
}

function ajaxDeleteCommentsFromTextArea_old(textAreaId)
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			deleteCommentsFromTextArea_old(textAreaId);
		}
    });
}

function ajaxDeleteEmptyNodesFromTextArea_old(textAreaId)
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			deleteEmptyNodesFromTextArea_old(textAreaId);
		}
    });
}

function ajaxMakeLinearXML_old(textAreaId)
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			makeLinearXML_old(textAreaId);
		}
    });
}

function ajaxShowRawMapping()
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			showRawMapping();
		}
    });
}

function ajaxShowESQLMapping()
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			showESQLMapping();
		}
    });
}

function ajaxCreateXSLT()
{
	$.ajax({
		type: "GET",
		url: ajaxUrl,
		success: function(msg){
			createXSLT();
		}
    });
}


