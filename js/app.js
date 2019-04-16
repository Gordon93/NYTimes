
// This function calls the API to get data
  function getData(displayGraph, num, sections, generateTable) {
    var articles = [];
    var filtered = {};

    $.ajax({
      url: "https://api.nytimes.com/svc/mostpopular/v2/emailed/" + num  + ".json?api-key=hmNzQpMlkLSsTGvnR8tpAOmibGDHwicU",
      CrossDomain: true,
      dataType: 'json',
      success: function(data) {
        articles = data.results;
        $.each(articles, function( index, value ) {
         if(sections.includes(value.section.toUpperCase()) || sections.includes(value.nytdsection.toUpperCase())){
           if((Object.keys(filtered)).includes(value.section)){
             filtered [value.section] ++;
           }
           else{
             filtered [value.section] = 1;
           }
         }
       });
        displayGraph(filtered);
        generateTable(articles, sections);
      },

      error: function(data) {
        console.log('error');
      }
    });
  }

  // create bar chart with axis and labels
  function displayGraph(filtered){

    var margin = {top: 20, right: 20, bottom: 40, left: 40},
      width = 600 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.05);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%Y-%m"));

  var yAxis = d3.axisLeft(y)
      .ticks(10);

  d3.selectAll("svg > *").remove();

  var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = [];
    $.each(filtered, function( index, value ) {
      var element = {};
      element.date = index;
      element.value = value;
      data.push(element);
    });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")

    svg.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });


    svg.selectAll(".text")
  	  .data(data)
  	  .enter()
  	  .append("text")
  	  .attr("class","label")
  	  .attr("x", (function(d) { return x(d.date); }))
  	  .attr("y", function(d) { return y(d.value)  ; })
  	  .attr("dy", "3em")
      .attr("dx", "3em")
  	  .text(function(d) { return d.date; });


  }

  function getControls(){
    var days = getNumDays();
    if(days == "null"){
      alert('Please select a valid option');
    }
    else{
      var filters = getFilters();
      if(jQuery.isEmptyObject(filters)){
        alert('Please select filters');
      }
      else{
      getData(displayGraph , days,filters, generateTable)
    }
    }
  }

  function getNumDays(){
    var days = $("#ddlNumDays :selected").val();
    return days;
  }

  function getFilters(){
    sections = [];
    $("input:checkbox:checked").each(function(){
     sections.push($(this).val());
     });
    return sections;
  }

  function generateTable(data , sections) {

    var articles = [];
    $.each(data, function( index, value ) {
      var element = {};
      element.section = value.section;
      element.title = value.title;
      element.url = value.url;
      articles.push(element);
    });
  $("#NYarticles").empty();  // remove previous entries if exist
  var tbl = document.getElementById("NYarticles");

   // create headers
  var headers = ["Section", "Title", "Url"];
  var row = document.createElement("tr");
   $.each(headers, function( index, value ) {
  var cell = document.createElement("td");
  var cellText = document.createTextNode(value);
  cell.style.textAlign="center";
  cell.style.fontWeight = "bold";
  cell.appendChild(cellText);
  row.appendChild(cell);
});
  tbl.appendChild(row);

   // populate dynamic data
   $.each(articles, function( index, obj ) {
     if(sections.includes(obj.section.toUpperCase())){

    var row = document.createElement("tr");

    $.each( obj, function( key, value ) {
      if(key != "url"){
      var cell = document.createElement("td");
      var cellText = document.createTextNode(value);
      cell.appendChild(cellText);
      row.appendChild(cell);
    }
    });

    var cell = document.createElement("td");
    var link = document.createElement("a");
    link.setAttribute("href", obj.url);
    link.setAttribute('target', '_blank');
    var linkText = document.createTextNode("view article");
    link.appendChild(linkText);
    cell.appendChild(link);
    row.appendChild(cell)

    tbl.appendChild(row);
  }
  });
  tbl.setAttribute("border", "2");
}
