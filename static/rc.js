'use strict';

$(function(){$('#output').html('');});

function RC_search(form)
{
	const outDiv = $('#output');
	const spinner = $('#spinner');
	spinner.css('display','block');
	
	$.ajax("api.php", {
			data: {searchStr: $('#searchStr').val(), field: $('#field').val()},
			dataType:"json"
		})
		.done(function(msg, textStatus, xhrObj){
			outDiv.css('color','#000');
			let outHtml = '';

			if(msg.countries.length == 0)
			{
				outHtml = 'None found.';
			}else{
				outHtml = 'Showing ' + msg.countries.length + ' of ' + msg.total + ' results.'
					+ '<table><tr><th>Name</th><th>Code2</th><th>Code3</th><th>Flag</th><th>Region</th><th>Subregion</th><th>Population</th><th>Languages</th></tr>';
				msg.countries.forEach(function(val){
					outHtml += '<tr><td>' + val.name + '</td><td>' + val.alpha2Code + '</td><td>' + val.alpha3Code + '</td><td><img src="' + val.flag + '"/></td><td>' + val.region + '</td><td>' + val.subregion + '</td><td>' + val.population + '</td><td>' + val.languages + '</td></tr>';
				});
				outHtml += '</table><h2>Summary of all results</h2><table><tr><th>Region</th><th>Countries</th></tr>';
				Object.keys(msg.regions).forEach(function(region){
					outHtml += '<tr><td>' + region + '</td><td>' + msg.regions[region].total + '</td></tr>';
					Object.keys(msg.regions[region].subregions).forEach(function(subregion){
						outHtml += '<tr><td>↳ ' + subregion + '</td><td>' + msg.regions[region].subregions[subregion] + '</td></tr>';
					});
				});
				outHtml += '</table>';
			}
			
			outDiv.html(outHtml);
		})
		.fail(function(xhrObj, statusStr, errorThrown){
			outDiv.css('color','#F00');
			outDiv.html(xhrObj.responseText);
		})
		.always(function(){
			spinner.css('display','none');
		});
}