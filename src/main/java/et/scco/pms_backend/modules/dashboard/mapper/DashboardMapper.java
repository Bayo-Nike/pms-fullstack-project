package et.scco.pms_backend.modules.dashboard.mapper;

import java.util.HashMap;
import java.util.Map;

public class DashboardMapper {

    // Usually, Dashboard data is a "Projection" of many entities, 
    // so we map specific query results to the DTO fields manually.
    public static Map<String, Object> mapChartData(String label, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", label);
        map.put("value", value);
        return map;
    }
    
}
