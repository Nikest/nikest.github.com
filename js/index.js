var svg = d3.select('svg');

d3.json('js/candidates_task.json', function(err, data) {
    d3.select('h2').text(data.anomalousProperty.key + ': ' + data.anomalousProperty.value);
    paint(data.significantVariables);
});

function paint(signVar) {

    var width = 500,
        height = 500,
        margin = 30,
        padding = 2,
        maxY = 0,
        minY = 0;

    var xAxisLength = width - 2 * margin;

    var yAxisLength = height - 2 * margin;

    for(var i = 0; i < signVar.length; i++) {
        if(signVar[i].relativeChange > maxY) maxY = signVar[i].relativeChange;
        if(signVar[i].relativeChange < minY) minY = signVar[i].relativeChange;
    }

    var scaleY = d3.scale.linear()
        .domain([maxY, minY])
        .range([0, yAxisLength]);

    var yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient('left');

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + margin + ',' + margin + ')')
        .call(yAxis);

    var scaleX = d3.scale.linear()
        .domain([0, signVar.length])
        .range([0, xAxisLength]);

    var xAxis = d3.svg.axis()
        .scale(scaleX)
        .orient('bottom');

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(' + margin + ',' + (height - margin) + ')')
        .call(xAxis);

    var y_column = function(val) {
        var top = (Math.sign(val) != -1)? 'true' : 'false';
        var yField = height - (margin * 2);
        var center = Math.abs((yField / ( Math.abs(maxY) + Math.abs(minY) )) * minY) + 11;
        var count = Math.abs((yField / ( Math.abs(maxY) + Math.abs(minY) )) * val);

        return {
            getY: function() {
                return (top == 'true')? center - count : center
            },
            getHeight: function() {
                return count
            },
            direction: top
        };
    };

    var x_column = function(val) {
        var xField = width - (margin * 2);
        var len = xField / signVar.length;

        return {
            getX: function() {
                return (len * val) + margin + padding
            },
            getWidth: function() {
                return len - (padding * 2)
            }
        }
    };

    d3.selectAll(signVar).each(function(e,r){
        var tip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style('top', y_column(signVar[r].relativeChange).getY() + 'px')
            .style('left', x_column(r).getX() + 'px');

        svg.append('rect')
            .attr('class', y_column(signVar[r].relativeChange).direction)
            .attr('x', x_column(r).getX())
            .attr('y', y_column(signVar[r].relativeChange).getY())
            .attr('width', x_column(r).getWidth())
            .attr('height', y_column(signVar[r].relativeChange).getHeight())
            .on('mouseover', function(){
                tip.style('opacity', .9)
                    .style('display', 'block')
                    .html(['<p><b>Key:</b> ' + signVar[r].key + '</p><br>',
                           '<p><b>Value:</b> ' + signVar[r].value + '</p><br>',
                           '<p><b>Relative Change:</b> ' + signVar[r].relativeChange + '</p><br>'].join(''));

            })
            .on('mouseout', function(d) {
                tip.style('opacity', 0)
                    .style('display', 'none');
            });
    });

}

