package et.scco.pms_backend.modules.dashboard.service.impl;

import et.scco.pms_backend.modules.admin.repository.ClientRepository;
import et.scco.pms_backend.modules.admin.repository.ConsultancyRepository;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.ContractorRepository;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
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

    private final ClientRepository clientRepository;
    private final ConsultancyRepository consultancyRepository;
    private final SubCityServiceImpl subCityServiceImpl;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ContractorRepository contractorRepository;
    private final SubCityRepository subCityRepository;
    private final TaskRepository taskRepository;
    private final ColorCodingRepository codingRepository;
    private final EmployeeServiceImpl employeeServiceImpl;

    @Override
    public DashboardSummaryDTO getSummary() {

        SubCity userSubCity = subCityServiceImpl.getCurrentUserSubCity();
        Long subId = (userSubCity != null) ? userSubCity.getId() : null;

        Employee employee = employeeServiceImpl.findEmployeeWithDivision();
        Division division = employee.getDivision();
        if (division == null) {
            throw new ResourceNotFoundException("Employee is not assigned to a division. Dashboard cannot be generated.");
        }

        DivisionGroup divisionGroup = division.getDivisionGroup();
        // If DivisionGroup is BTH BTH, projectTypeFilter remains null (meaning no filtering)
        // else if BLD = BUILDING or WAR = WATER_AND_ROAD
        ProjectType projectType = null;
        if (divisionGroup == DivisionGroup.BLD) {
            projectType = ProjectType.BUILDING;
        } else if (divisionGroup == DivisionGroup.WAR) {
            projectType = ProjectType.WATER_AND_ROAD;
        }

        List<Map<String, Object>> colorCodePerformanceMetrics = (subId == null) 
        ? codingRepository.getPerformanceBySubCityDetailed() 
        : codingRepository.getPerformanceByBuildingType(subId);
 
        return DashboardSummaryDTO.builder()
            // Counts: Ternary logic used for simple counts
            .employeeCount(subId == null ? employeeRepository.count() : employeeRepository.countBySubCityId(subId))
            .userCount(subId == null ? userRepository.count() : userRepository.countByEmployeeSubCityId(subId))
            .contractorCount(contractorRepository.count())
            .consultantCount(consultancyRepository.count())
            .clientCount(clientRepository.count()) 
        //     .projectCount(subId == null ? projectRepository.count() : projectRepository.countBySubCityId(subId))
            .projectCount(subId == null
                ? projectRepository.countByPhaseAndProjectType(ProjectPhase.EXECUTION, projectType)
                : projectRepository.countBySubCityIdAndPhase(subId, ProjectPhase.EXECUTION))
            .initiationCount(subId == null
                ? projectRepository.countByPhaseAndProjectType(ProjectPhase.INITIATION, projectType)
                : projectRepository.countBySubCityIdAndPhase(subId, ProjectPhase.INITIATION))
        //     .taskCount(subId == null ? taskRepository.count() : taskRepository.countByProjectSubCityId(subId))
            .taskCount(subId == null ? taskRepository.countByProjectPhaseAndProjectType(ProjectPhase.EXECUTION, projectType)
                        : taskRepository.countByProjectSubCityIdAndProjectPhase(subId,ProjectPhase.EXECUTION))
            .subCityCount(subId == null ? subCityRepository.count() : 1)
            .colorCodingCount(subId == null ? codingRepository.count() : codingRepository.countBySubCity(userSubCity))
            
            // Financials & Charts: These methods now handle the null subId internally
            // .totalBudget(projectRepository.sumTotalBudget(subId))
            .budgetByCurrency(projectRepository.sumBudgetByCurrencyAndProjectType(subId, projectType)) // Use the new multi-currency method
            .projectsBySubCity(projectRepository.countProjectsBySubCityAndPhaseAndProjectType(subId, ProjectPhase.EXECUTION, projectType))
            .budgetTrend(projectRepository.getMonthlyBudgetTrendByProjectType(subId, projectType != null ? projectType.name() : null))
            .colorCodePerformanceMetrics(colorCodePerformanceMetrics)
            .projectsByStatus(subId == null 
                    ? projectRepository.getProjectStatusDetailed(ProjectPhase.EXECUTION, projectType) 
                    : projectRepository.countProjectsByStatusBySubCityAndPhase(subId, ProjectPhase.EXECUTION))
            .tasksByStatus(subId == null 
                    ? taskRepository.getTaskStatusDetailed(ProjectPhase.EXECUTION, projectType) 
                    : taskRepository.getTaskStatusDetailedBySubCityAndPhase(subId, ProjectPhase.EXECUTION))

            .build();
    }

}
