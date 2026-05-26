package et.scco.pms_backend.utility;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Position;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.repository.PositionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class JurisdictionUtility {

    private final AuthContext authContext;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public Long mySupervisor() {

        Employee employee = authContext.getEmployee();
        if (employee == null) return null;

        Employee fullEmployee = employeeRepository
                .findByIdWithPositionTree(employee.getId())
                .orElse(null);

        if (fullEmployee == null || fullEmployee.getPosition() == null) return null;

        Position parent = fullEmployee.getPosition().getParent();
        if (parent == null) return null;

        return employeeRepository.findByPosition_Id(parent.getId())
                .map(Employee::getId)
                .orElse(1L);
    }

    @Transactional(readOnly = true)
    public List<Long> myHierarchyUp() {

        List<Long> result = new ArrayList<>();

        Employee employee = authContext.getEmployee();
        if (employee == null) return result;

        Employee fullEmployee = employeeRepository
                .findByIdWithPositionTree(employee.getId())
                .orElse(null);

        if (fullEmployee == null || fullEmployee.getPosition() == null) return result;

        Position current = fullEmployee.getPosition();

        while (current.getParent() != null) {

            Position parent = current.getParent();

            employeeRepository.findByPosition_Id(parent.getId())
                    .ifPresent(e -> result.add(e.getId()));

            current = parent;
        }

        return result;
    }

    // @Transactional(readOnly = true)
    // public List<ReportToResponseDto> myReportees()
    // {
    //     Employee employee = authContext.getEmployee();

    //     if (employee == null) return List.of();

    //     Position position = employee.getPosition();
    //     if (position == null) return List.of();

    //     List<Position> allPositions = positionRepository.findAll();

    //     Map<Long, List<Position>> childrenMap = new HashMap<>();
    //     for (Position p : allPositions) {
    //         Long parentId = (p.getParent() != null) ? p.getParent().getId() : null;

    //         childrenMap
    //                 .computeIfAbsent(parentId, k -> new ArrayList<>())
    //                 .add(p);
    //     }

    //     List<Long> positionIds =
    //             findAllChildren(position.getId(), childrenMap);

    //     return employeeRepository.findAllByPosition_IdIn(positionIds)
    //             .stream()
    //             .map(e -> new ReportToResponseDto(
    //                     e.getId(),
    //                     e.getFullName(),
    //                     e.getPosition().getId(),
    //                     e.getPosition().getName()
    //             ))
    //             .toList();
    // }

    // private List<Long> findAllChildren(Long positionId,
    //                                    Map<Long, List<Position>> childrenMap) {
    //     List<Long> result = new ArrayList<>();
    //     Set<Long> visited = new HashSet<>();

    //     collect(positionId, childrenMap, result, visited);
    //     return result;
    // }

    // private void collect(Long parentId,
    //                      Map<Long, List<Position>> childrenMap,
    //                      List<Long> result,
    //                      Set<Long> visited) {

    //     if (!visited.add(parentId)) return;

    //     List<Position> children = childrenMap.get(parentId);
    //     if (children == null) return;

    //     for (Position child : children) {
    //         result.add(child.getId());
    //         collect(child.getId(), childrenMap, result, visited);
    //     }
    // }


    @Transactional(readOnly = true)
    public ReportToResponseDto myReportees() {
        Employee currentEmployee = authContext.getEmployee();
        if (currentEmployee == null || currentEmployee.getPosition() == null) return null;

        // Re-fetch or initialize the position to avoid proxy issues
        Long rootPositionId = currentEmployee.getPosition().getId();
        
        List<Position> allPositions = positionRepository.findAllWithParent();
        List<Employee> allEmployees = employeeRepository.findAllWithPosition();

        Position rootPosition = allPositions.stream()
                .filter(p -> p.getId().equals(rootPositionId))
                .findFirst()
                .orElse(null);

        if (rootPosition == null) return null;

        Map<Long, List<Employee>> posEmps = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getPosition().getId()));

        Map<Long, List<Position>> childPos = allPositions.stream()
                .filter(p -> p.getParent() != null)
                .collect(Collectors.groupingBy(p -> p.getParent().getId()));

        return buildTreeNode(rootPosition, posEmps, childPos);
    }

    private ReportToResponseDto buildTreeNode(Position pos, 
                                         Map<Long, List<Employee>> empMap, 
                                         Map<Long, List<Position>> childMap) {
        List<Employee> emps = empMap.getOrDefault(pos.getId(), List.of());
        
        // Use the first employee found in this position
        Employee emp = emps.isEmpty() ? null : emps.get(0);

        ReportToResponseDto node = new ReportToResponseDto(
                emp != null ? emp.getId() : null,
                emp != null ? emp.getFullName() : "VACANT",
                pos.getId(),
                pos.getName()
        );

        List<Position> children = childMap.getOrDefault(pos.getId(), List.of());
        for (Position child : children) {
            node.getChildren().add(buildTreeNode(child, empMap, childMap));
        }

        return node;
    }
}
