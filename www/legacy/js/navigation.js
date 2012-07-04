/*
 * This file contains JS functions required to navigate within the app
 */

var slideOrder = new Array();
slideOrder["empty"] = new Array(null, "input");
slideOrder["input"] = new Array("empty", "check");
slideOrder["check"] = new Array("input", "visualize");
slideOrder["visualize"] = new Array("check", "publish");
slideOrder["publish"] = new Array("visualize", null);

function showSlide(next, current){
    
    currentSlide = next;

    $("#"+current).hide("drop", 500, function(){
        

        //changes the color of the breadcrumbs
        $("#crumbs_"+current).attr("class", "off");
        $('#crumbs_'+next).attr("class", "on");

        //Changes the hash in the URL
        window.location.hash = currentSlide;

        //Removes or add the prev next buttons if need be
        if (slideOrder[currentSlide][0] && slideOrder[currentSlide][0] != "empty"){
            $("#button_prev").show();
        }else{
            $("#button_prev").hide();
        }

        if (slideOrder[currentSlide][1]){
            $("#next").show();
            $("#new_chart").hide();
        }else{
            $("#next").hide();
            $("#new_chart").show();
        }

        $('#'+next).show("drop", 500, function(){
            
            //repeats the command in case the slide didn't go fast enough
            $("#"+current).hide();

            return false;
               
        });

        return false;

    });
    
}

function dispatchNext(){

    loader_show();

    var post_opts;

    switch (currentSlide){
        case "input":
            
            //checks that some data is present

            var data = "";

            data = $("#"+ currentSlide +"_data").val();

            if (data == ""){
                error(texts.no_data);
                loader_hide();
                return false;
            }

            post_opts = { chart_id: chart_id, data: data, action: "setData" };
            break;

        case "check":
            post_opts = { chart_id: chart_id, action: "none" };
            break;

        case "visualize":
            post_opts = { chart_id: chart_id, opts: JSON.stringify(options), action: "storeVis" };
            break;

        case "publish":
            post_opts = { chart_id: chart_id, action: "getData" };
            break;
    }

    $.post("actions/charts.php", post_opts,
    function(data) {
        
        if (data != ""){

            data = jQuery.parseJSON(data);

            if (data.status == 200){

                //Updates the current working chart
                chart_id = data.chart_id;
                
                //Goes to the next slide
                showNext();
                
            }else{
                error(data.error);
            }

        }else{
            error();
        }

    });
}

function showNext(){

	var nextSlide = slideOrder[currentSlide][1];
	var nextSlide_JS = "js_enterScreen_"+nextSlide;

	//Advances to the next slide
    showSlide(nextSlide, currentSlide);

    //Executes the javascript of the new slide
    eval(nextSlide_JS)();

}

function showPrev(){
    showSlide(slideOrder[currentSlide][0], currentSlide);
}