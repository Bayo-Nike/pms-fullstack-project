package et.scco.pms_backend.modules.dashboard.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
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

}
