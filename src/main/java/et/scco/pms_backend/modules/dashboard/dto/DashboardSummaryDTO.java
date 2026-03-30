package et.scco.pms_backend.modules.dashboard.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DashboardSummaryDTO {

    private long employeeCount;
    private long userCount;
    private long contractorCount;
    private long projectCount;
    private long taskCount;
    // private double totalBudget;
    private List<Map<String, Object>> budgetByCurrency; // [{name: "ETB", value: 100}, ...]
    private long subCityCount;
    
    // Data for Charts
    private List<Map<String, Object>> projectsBySubCity; // [{name: "Bole", value: 10}, ...]
    private List<Map<String, Object>> budgetTrend;       // [{month: "Jan", amount: 4000}, ...]

    private Long colorCodingCount;
    // THE BAR CHART
    private List<Map<String, Object>> colorCodePerformanceMetrics; // [{name: "Koye Fache", target: 100, achieved: 85}, ...]
    
    private List<Map<String, Object>> projectsByStatus; // [{name: "ONGOING", value: 12}, ...]
    private List<Map<String, Object>> tasksByStatus;

}
