package et.scco.pms_backend.modules.dashboard.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.ContractorRepository;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.dashboard.dto.DashboardSummaryDTO;
import et.scco.pms_backend.modules.dashboard.service.DashboardService;
import et.scco.pms_backend.modules.planning.repository.ColorCodingRepository;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SubCityServiceImpl subCityServiceImpl;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ContractorRepository contractorRepository;
    private final SubCityRepository subCityRepository;
    private final TaskRepository taskRepository;
    private final ColorCodingRepository codingRepository;

    @Override
    public DashboardSummaryDTO getSummary() {

        SubCity userSubCity = subCityServiceImpl.getCurrentUserSubCity();
        Long subId = (userSubCity != null) ? userSubCity.getId() : null;
        List<Map<String, Object>> performanceMetrics = (subId == null) 
        ? codingRepository.getPerformanceBySubCityDetailed() 
        : codingRepository.getPerformanceByBuildingType(subId);
 
        return DashboardSummaryDTO.builder()
            // Counts: Ternary logic used for simple counts
            .employeeCount(subId == null ? employeeRepository.count() : employeeRepository.countBySubCityId(subId))
            .userCount(subId == null ? userRepository.count() : userRepository.countByEmployeeSubCityId(subId))
            .contractorCount(contractorRepository.count()) 
            .projectCount(subId == null ? projectRepository.count() : projectRepository.countBySubCityId(subId))
            .taskCount(subId == null ? taskRepository.count() : taskRepository.countByProjectSubCityId(subId))
            .subCityCount(subId == null ? subCityRepository.count() : 1)
            .colorCodingCount(subId == null ? codingRepository.count() : codingRepository.countBySubCity(userSubCity))
            
            // Financials & Charts: These methods now handle the null subId internally
            // .totalBudget(projectRepository.sumTotalBudget(subId))
            .budgetByCurrency(projectRepository.sumBudgetByCurrency(subId)) // Use the new multi-currency method
            .projectsBySubCity(projectRepository.countProjectsBySubCity(subId))
            .budgetTrend(projectRepository.getMonthlyBudgetTrend(subId))
            .performanceMetrics(performanceMetrics)
            .projectsByStatus(subId == null 
                ? projectRepository.countProjectsByStatus() 
                : projectRepository.countProjectsByStatusBySubCity(subId))

            .build();
    }

}
