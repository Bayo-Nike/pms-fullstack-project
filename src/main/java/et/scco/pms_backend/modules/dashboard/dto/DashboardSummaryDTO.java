package et.scco.pms_backend.modules.dashboard.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryDTO {

    private long employeeCount;
    private long userCount;
    private long contractorCount;
    private long projectCount;
    private long taskCount;
    private double totalBudget;
    private long subCityCount;
    
    // Data for Charts
    private List<Map<String, Object>> projectsBySubCity; // [{name: "Bole", value: 10}, ...]
    private List<Map<String, Object>> budgetTrend;       // [{month: "Jan", amount: 4000}, ...]
}
