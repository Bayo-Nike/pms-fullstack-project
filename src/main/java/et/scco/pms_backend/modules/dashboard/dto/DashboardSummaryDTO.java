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
    private long consultantCount;
    private long clientCount;
    private long projectCount;
    private long initiationCount;
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

    // Clients (External User)
    private Long userCountAsPerClient;
    private long countPendingDemand;
    private long countApprovedDemandCount;
    private long countRejectedDemandCount;
    private long clientTaskCount;

    private List<Map<String, Object>> clientBudgetByCurrency; // [{name: "ETB", value: 100}, ...]
    // Data for Charts
    private List<Map<String, Object>> clientProjectsBySubCity; // [{name: "Bole", value: 10}, ...]
    private List<Map<String, Object>> clientBudgetTrend;       // [{month: "Jan", amount: 4000}, ...]
    private List<Map<String, Object>> clientProjectsByStatus; // [{name: "ONGOING", value: 12}, ...]
    private List<Map<String, Object>> clientTasksByStatus;

}
