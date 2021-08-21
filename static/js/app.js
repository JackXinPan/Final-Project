
  var form_data = JSON.parse((document.getElementById("testdata").dataset.form_data));

  var watertype = form_data["watertype"] == "SW" ? "Surface Water":"Ground Water";

  var file = form_data["watertype"] == "SW" ? "/static/data/SW_Data.csv":"/static/data/GW_Data.csv";

// Call database data
d3.csv(file, function(SW_data) {

    // parse data
    SW_data.forEach(function(data) {
      data.TTHM = +data.TTHM;
      data['Dose Rate (mg/L)'] = +data['Dose Rate (mg/L)'];
      data['30 min decay'] = +data['30 min decay']
      data.pH = +data.pH;
      data.COND = +data.COND;
      data.Turb = +data.Turb;
      data.Cl = +data.Cl;
      data.Br = +data.Br;
      data.COLOUR = +data.COLOUR;
      data.FOC = +data.FOC;
      data.UVA = +data.UVA;
      data.SUVA = +data.SUVA;

    });
  

  console.log(SW_data.columns.slice(4))
  // default options for disease group, year and location


  // get list of all disease groups for dropdown list
  var parameters = SW_data.columns.slice(4,5).concat(SW_data.columns.slice(10));

  var formparameters = {"Dose Rate (mg/L)":"doserate", "FOC":"foc", "UVA":"uva", "Br":"br","Cl":"cl","30 min decay":"t30","TURB":"turb","COND":"cond","pH":"pH","COLOUR":"colour"};

  var parameter = "Dose Rate (mg/L)";

  var formparameter = formparameters[parameter];

  d3.select("#scattersummary").html(`TTHM vs ${parameter} in ${watertype}`)

  d3.select("#barsummary").html(`Distribution of TTHMs in ${watertype}`)
  

  

  

  // get list of all years for dropdown list

  // append options to menu
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(parameters)
    .enter()
    .append('option')
    .text(d => d) 
    .attr("value", d => d);

  var prediction = JSON.parse(document.getElementById("predictedTTHM").dataset.prediction);

  // var form_data = JSON.parse((document.getElementById("testdata").dataset.form_data));

  // var watertype = form_data["watertype"] == "SW" ? "Surface Water":"Ground Water";
      

 

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 50, left: 80},
  width = 830 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svgbar = d3.select("#bar")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



  // X axis: scale and draw:
  var x = d3.scaleLinear()
  .domain([0, 550])     
  .range([0, width]);
  svgbar.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.histogram()
  .value(function(d) { return d.TTHM; })   
  .domain(x.domain())  
  .thresholds(x.ticks(30)); 

  // And apply this function to data to get the bins
  var bins = histogram(SW_data);
  console.log(bins)
  // Y axis: scale and draw:
  var y = d3.scaleLinear()
  .range([height, 0]);
  y.domain([0, d3.max(bins, function(d) { return d.length; })]);   
  svgbar.append("g")
  .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  var barchart = svgbar.selectAll("rect")
  .data(bins)
  .enter()
  .append("rect")
    .attr("x", 1)
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
    .attr("width", function(d) { return x(d.x1) - x(d.x0)-1 ; })
    .attr("height", function(d) { return height - y(d.length); })
    .style("fill", "#69b3a2")


  // x axis label
  svgbar.append("g")
    .attr("text-anchor", "middle")
    .attr("font-size",14)
    .attr("fill","black")
    .append("text")
    .attr("transform", "translate("+width/2 + "," + (height+40) + ")")
    .attr("id","xs")
    .text("TTHM (ug/L)")

  // y axis label
  svgbar.append("g")
  .attr("text-anchor", "middle")
  .attr("font-size",14)
  .attr("fill","black")
  .append("text")
  .attr("y", -40)
  .attr("x", -height/2)
  .attr("transform","rotate(-90)")
  .attr("id","xs")
  .text("Count")


  var star = d3.symbol().type(d3.symbolStar).size(80);


  svgbar.append("path")
  .attr("d",star)
  .attr("transform","translate(" + x(prediction) +"," + y(5) +")")
  .attr("stroke","rgb(175,0,42)")
  .attr("fill-opacity","0.5")
  .attr("fill","rgb(227,38,54)");

  svgbar.append("text")
  .text("predicted TTHM")
  .attr("transform","translate(615,10)")
  .attr("stroke","gray")
  .attr("fill","gray");

  svgbar.append("path")
  .attr("d",star)
  .attr("transform","translate(600,5)")
  .attr("stroke","rgb(175,0,42)")
  .attr("fill-opacity","0.5")
  .attr("fill","rgb(227,38,54)");


    //initialise map tool tip
    var bartoolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 29])
        .html(d => { return (`<h6>Average TTHM: ${Math.round(d.map(e => +e.TTHM).reduce((a,b)=> a+b)/d.length)} </h6><h6>Count: ${d.length}</h6><h6>Predicted TTHM: ${Math.round(prediction)}</h6>`)});
    
    // add tooltip to map
    barchart.call(bartoolTip);
    
    // on mouseover show tooltip
    barchart.on("mouseover", function(d) {
      bartoolTip.show(d, this)
      d3.select(this).style("stroke","black")
            })
    // on mouseout hide tooltip      
            .on("mouseout", function(d) {
              bartoolTip.hide(d)
              d3.select(this).style("stroke",null)
            });   




  // append the svg object to the body of the page
  var scattersvg = d3.select("#scatter")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");




  // Add X axis
  var xs = d3.scaleLinear()
  .domain([0, 13])
  .range([ 0, width ]);


// Add Y axis
var ys = d3.scaleLinear()
  .domain([d3.min(SW_data, d =>d.TTHM)*0.9,d3.max(SW_data, d =>d.TTHM)*1.1])
  .range([height, 0]);


  var yAxis = d3.axisLeft(ys);
  var xAxis = d3.axisBottom(xs);

  scattersvg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "xaxis")
  .call(xAxis);


  scattersvg.append("g")
  .attr("class", "yaxis")
  .call(yAxis);

// Add dots
var scatterplot = scattersvg.append('g')
  .selectAll("dot")
  .data(SW_data)
  .enter()
  .append("circle")
    .attr("cx", function (d) {  return xs(d["Dose Rate (mg/L)"]); } )
    .attr("cy", function (d) { return ys(d.TTHM); } )
    .attr("r", 5)
    .style("fill", "#69b3a2")
    .style("opacity",0.8)

  scattersvg.append("path")
    .attr("d",star)
    .attr("class","marker")
    .attr("transform","translate(" + xs(+form_data[formparameter]) +"," + ys(prediction) +")")
    .attr("stroke","rgb(175,0,42)")
    .attr("fill-opacity","0.5")
    .attr("fill","rgb(227,38,54)");

      // x axis label
  scattersvg.append("g")
  .attr("text-anchor", "middle")
  .attr("font-size",14)
  .attr("fill","black")
  .append("text")
  .attr("transform", "translate("+width/2 + "," + (height+40) + ")")
  .attr("id","xs")
  .text("Dose Rate (mg/L)")

  // y axis label
  scattersvg.append("g")
  .attr("text-anchor", "middle")
  .attr("font-size",14)
  .attr("fill","black")
  .append("text")
  .attr("y", -50)
  .attr("x", -height/2)
  .attr("transform","rotate(-90)")
  .attr("id","xs")
  .text("TTHM (ug/L)")



  scattersvg.append("text")
  .text("predicted TTHM")
  .attr("transform","translate(615,10)")
  .attr("stroke","gray")
  .attr("fill","gray");

  scattersvg.append("path")
  .attr("d",star)
  .attr("transform","translate(600,5)")
  .attr("stroke","rgb(175,0,42)")
  .attr("fill-opacity","0.5")
  .attr("fill","rgb(227,38,54)");

      //initialise map tool tip
      var scattertoolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 25])
      .html(d => { return (`<h6>TTHM: ${d.TTHM} </h6><h6>Dose Rate: ${d["Dose Rate (mg/L)"]}</h6><h6>Predicted TTHM: ${Math.round(prediction)}</h6>`)});
  
  // add tooltip to map
  scatterplot.call(scattertoolTip);
  
  // on mouseover show tooltip
  scatterplot.on("mouseover", function(d) {
    scattertoolTip.show(d, this)
    d3.select(this).style("stroke","black")
          })
  // on mouseout hide tooltip      
          .on("mouseout", function(d) {
            scattertoolTip.hide(d)
            d3.select(this).style("stroke",null)
          });   





/*  EVENT LISTENER TO CHANGE CHART FILTER OPTIONS  */

            
    // on group option selected change option value and run update
    d3.select("#selectButton").on("change", function(d) {   
      parameter = d3.select(this).property("value")
      formparameter = formparameters[parameter]
      updateChart(parameter,formparameter)

      });



      function updateChart(parameter,formparameter) {

        scattersvg.select(".marker").remove()

        d3.select("#scattersummary").html(`TTHM vs ${parameter} in ${watertype}`)

        xs.domain([d3.min(SW_data, d =>d[parameter])*0.9,d3.max(SW_data, d =>d[parameter])*1.1])
        scattersvg.select(".xaxis")
        .transition()
        .duration(1000)
        .call(xAxis);
  
        scatterplot.data(SW_data)
        .transition()
        .duration(1000)
        .attr("cx", d => xs(d[parameter]));



        if (form_data[formparameter] > 0) {
          scattersvg.append("path")
          .attr("d",star)
          .attr("class","marker")
          .attr("transform","translate(" + xs(+form_data[formparameter]) +"," + ys(prediction) +")")
          .attr("stroke","rgb(175,0,42)")
          .attr("fill-opacity","0.5")
          .attr("fill","rgb(227,38,54)");
        }
        else {
          d3.select("#myAlert").attr("style","display")
        }
          
        scattertoolTip.html(d => { return (`<h6>TTHM: ${d.TTHM} </h6><h6>${parameter}: ${d[parameter]}</h6><h6>Predicted TTHM: ${Math.round(prediction)}</h6>`)});
    
      };


      });



