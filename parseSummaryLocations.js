
module.exports = function parseSummaryLocations(summary_data, principal_max_strain, principal_min_strain, axonal_strain_max, csdm_max, masXsr_15_max,
	CSDM_5, CSDM_10, CSDM_15, CSDM_30, MPS_95, MPSR_120, MPSxSR_28, MPSxSR_95, maximum_PSxSR) {
  
	if (
	  summary_data["principal-max-strain"] &&
	  summary_data["principal-max-strain"].location
	) {
	  let coordinate = {};
	  coordinate.x = summary_data["principal-max-strain"].location[0];
	  coordinate.y = summary_data["principal-max-strain"].location[1];
	  coordinate.z = summary_data["principal-max-strain"].location[2];
	  if (summary_data["principal-max-strain"]["brain-region"]) {
		region = summary_data["principal-max-strain"][
		  "brain-region"
		].toLowerCase();
        coordinate.region = region;
		principal_max_strain[region] = principal_max_strain[region] || [];
  
		if (summary_data["principal-max-strain"].value) {
		  coordinate.value = summary_data["principal-max-strain"].value;
		}
		principal_max_strain[region].push(coordinate);
	  }
	}
	if (
	  summary_data["principal-min-strain"] &&
	  summary_data["principal-min-strain"].location
	) {
	  let coordinate = {};
	  coordinate.x = summary_data["principal-min-strain"].location[0];
	  coordinate.y = summary_data["principal-min-strain"].location[1];
	  coordinate.z = summary_data["principal-min-strain"].location[2];
	  if (summary_data["principal-min-strain"]["brain-region"]) {
		region = summary_data["principal-min-strain"][
		  "brain-region"
		].toLowerCase();
		principal_min_strain[region] = principal_min_strain[region] || [];
  
		if (summary_data["principal-min-strain"].value) {
		  coordinate.value = summary_data["principal-min-strain"].value;
		}
		principal_min_strain[region].push(coordinate);
	  }
	}
	if (
	  summary_data["axonal-strain-max"] &&
	  summary_data["axonal-strain-max"].location
	) {
	  let coordinate = {};
	  coordinate.x = summary_data["axonal-strain-max"].location[0];
	  coordinate.y = summary_data["axonal-strain-max"].location[1];
	  coordinate.z = summary_data["axonal-strain-max"].location[2];
	  if (summary_data["axonal-strain-max"]["brain-region"]) {
		region = summary_data["axonal-strain-max"]["brain-region"].toLowerCase();
		axonal_strain_max[region] = axonal_strain_max[region] || [];
		if (summary_data["axonal-strain-max"].value) {
		  coordinate.value = summary_data["axonal-strain-max"].value;
		}
		axonal_strain_max[region].push(coordinate);
	  }
	}
	if (summary_data["csdm-max"] && summary_data["csdm-max"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["csdm-max"].location[0];
	  coordinate.y = summary_data["csdm-max"].location[1];
	  coordinate.z = summary_data["csdm-max"].location[2];
	  if (summary_data["csdm-max"]["brain-region"]) {
		region = summary_data["csdm-max"]["brain-region"].toLowerCase();
		csdm_max[region] = csdm_max[region] || [];
		if (summary_data["csdm-max"].value) {
		  coordinate.value = summary_data["csdm-max"].value;
		}
		csdm_max[region].push(coordinate);
	  }
	}
	if (summary_data["masXsr-15-max"] && summary_data["masXsr-15-max"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["masXsr-15-max"].location[0];
	  coordinate.y = summary_data["masXsr-15-max"].location[1];
	  coordinate.z = summary_data["masXsr-15-max"].location[2];
	  if (summary_data["masXsr-15-max"]["brain-region"]) {
		region = summary_data["masXsr-15-max"]["brain-region"].toLowerCase();
		masXsr_15_max[region] = masXsr_15_max[region] || [];
		if (summary_data["masXsr-15-max"].value) {
		  coordinate.value = summary_data["masXsr-15-max"].value;
		}
		masXsr_15_max[region].push(coordinate);
	  }
	}
  


	function parse_array_data(summary_data, strain_metric, target_object)
	{
		var result = {}
		if(summary_data[strain_metric])
		{
			result.msc = parse_by_property(summary_data, strain_metric, "msc");
			result.stem = parse_by_property(summary_data, strain_metric, "stem");
			result.cerebellum = parse_by_property(summary_data, strain_metric, "cerebellum");
			result.frontal = parse_by_property(summary_data, strain_metric, "frontal");
			result.parietal = parse_by_property(summary_data, strain_metric, "parietal");
			result.occipital = parse_by_property(summary_data, strain_metric, "occipital");
			result.temporal = parse_by_property(summary_data, strain_metric, "temporal");
		}
		Object.assign(target_object, result);
	}

	function parse_by_property(summary_data, strain_metric, brain_region)
	{
		if(summary_data[strain_metric][brain_region])
		{
			var result = summary_data[strain_metric][brain_region].map(element => {
				let coordinate = {};
				coordinate.x = element[0];
				coordinate.y = element[1];
				coordinate.z = element[2];
				if(summary_data[strain_metric].value)
				{
					coordinate.value = summary_data[strain_metric].value;
				}
				return coordinate;
			});

			return result;
	  }
	}

	parse_array_data(summary_data, "MPS-95", MPS_95);
	parse_array_data(summary_data, "CSDM-5", CSDM_5);
	parse_array_data(summary_data, "CSDM-10", CSDM_10);
	parse_array_data(summary_data, "CSDM-15", CSDM_15);
	parse_array_data(summary_data, "CSDM_30", CSDM_30);
	


	if (summary_data["MPSR-120"] && summary_data["MPSR-120"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["MPSR-120"].location[0];
	  coordinate.y = summary_data["MPSR-120"].location[1];
	  coordinate.z = summary_data["MPSR-120"].location[2];
	  if (summary_data["MPSR-120"]["brain-region"]) {
		region = summary_data["MPSR-120"]["brain-region"].toLowerCase();
		MPSR_120[region] = MPSR_120[region] || [];
		if (summary_data["MPSR-120"].value) {
		  coordinate.value = summary_data["MPSR-120"].value;
		}
		MPSR_120[region].push(coordinate);
	  }
	}
  
	if (summary_data["MPSxSR-28"] && summary_data["MPSxSR-28"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["MPSxSR-28"].location[0];
	  coordinate.y = summary_data["MPSxSR-28"].location[1];
	  coordinate.z = summary_data["MPSxSR-28"].location[2];
	  if (summary_data["MPSxSR-28"]["brain-region"]) {
		region = summary_data["MPSxSR-28"]["brain-region"].toLowerCase();
		MPSxSR_28[region] = MPSxSR_28[region] || [];
		if (summary_data["MPSxSR-28"].value) {
		  coordinate.value = summary_data["MPSxSR-28"].value;
		}
		MPSxSR_28[region].push(coordinate);
	  }
	}
  
	if (summary_data["MPSxSR-95"] && summary_data["MPSxSR-95"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["MPSxSR-95"].location[0];
	  coordinate.y = summary_data["MPSxSR-95"].location[1];
	  coordinate.z = summary_data["MPSxSR-95"].location[2];
	  if (summary_data["MPSxSR-95"]["brain-region"]) {
		region = summary_data["MPSxSR-95"]["brain-region"].toLowerCase();
		MPSxSR_95[region] = MPSxSR_95[region] || [];
		if (summary_data["MPSxSR-95"].value) {
		  coordinate.value = summary_data["MPSxSR-95"].value;
		}
		MPSxSR_95[region].push(coordinate);
	  }
	}
  
	if (summary_data["maximum-PSxSR"] && summary_data["maximum-PSxSR"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["maximum-PSxSR"].location[0];
	  coordinate.y = summary_data["maximum-PSxSR"].location[1];
	  coordinate.z = summary_data["maximum-PSxSR"].location[2];
	  if (summary_data["maximum-PSxSR"]["brain-region"]) {
		region = summary_data["maximum-PSxSR"]["brain-region"].toLowerCase();
		maximum_PSxSR[region] = maximum_PSxSR[region] || [];
		if (summary_data["maximum-PSxSR"].value) {
		  coordinate.value = summary_data["maximum-PSxSR"].value;
		}
		maximum_PSxSR[region].push(coordinate);
	  }
	}
  }
