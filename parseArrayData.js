module.exports = function parseArrayData(summary_data, array_summary_object)  {


        function parse_array_data(summary_data, target_object)
        {
            var result = {}
                result.msc = parse_by_property(summary_data, "msc");
                result.stem = parse_by_property(summary_data, "stem");
                result.cerebellum = parse_by_property(summary_data, "cerebellum");
                result.frontal = parse_by_property(summary_data, "frontal");
                result.parietal = parse_by_property(summary_data, "parietal");
                result.occipital = parse_by_property(summary_data, "occipital");
                result.temporal = parse_by_property(summary_data, "temporal");
            Object.assign(target_object, result);
        }
    
        function parse_by_property(summary_data, brain_region)
        {
            if(summary_data[brain_region])
            {
                var result = summary_data[brain_region].map(element => {
                    let coordinate = {};
                    coordinate.x = element[0];
                    coordinate.y = element[1];
                    coordinate.z = element[2];
                    if(summary_data[brain_region].value)
                    {
                        coordinate.value = summary_data[brain_region].value;
                    }
                    return coordinate;
                });
    
                return result;
          }
        }
    
        parse_array_data(summary_data, array_summary_object);

    }