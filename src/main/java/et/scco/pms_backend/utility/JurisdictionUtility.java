package et.scco.pms_backend.utility;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Position;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.repository.PositionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class JurisdictionUtility {

    private final AuthContext authContext;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;


    public Long mySupervisor() {
        Employee employee = authContext.getEmployee();

        if (employee == null) return null;

        Position position = employee.getPosition();
        if (position == null) return null;

        Position parent = position.getParent();
        if (parent == null) return null;

        return employeeRepository.findByPosition_Id(parent.getId())
                .map(Employee::getId)
                .orElse(null);
    }

    public List<Long> myHierarchyUp()
    {
        List<Long> result = new ArrayList<>();

        Employee employee = authContext.getEmployee();
        if (employee == null) return result;

        Position current = employee.getPosition();
        if (current == null) return result;

        while (current.getParent() != null) {
            Position parent = current.getParent();

            if (parent.getParent() == null) break;

            employeeRepository.findByPosition_Id(parent.getId())
                    .ifPresent(e -> result.add(e.getId()));

            current = parent;
        }

        return result;
    }


    public List<ReportToResponseDto> myReportees()
    {
        Employee employee = authContext.getEmployee();

        if (employee == null) return List.of();

        Position position = employee.getPosition();
        if (position == null) return List.of();

        List<Position> allPositions = positionRepository.findAll();

        Map<Long, List<Position>> childrenMap = new HashMap<>();
        for (Position p : allPositions) {
            Long parentId = (p.getParent() != null) ? p.getParent().getId() : null;

            childrenMap
                    .computeIfAbsent(parentId, k -> new ArrayList<>())
                    .add(p);
        }

        List<Long> positionIds =
                findAllChildren(position.getId(), childrenMap);

        return employeeRepository.findAllByPosition_IdIn(positionIds)
                .stream()
                .map(e -> new ReportToResponseDto(
                        e.getId(),
                        e.getFullName(),
                        e.getPosition().getId(),
                        e.getPosition().getName()
                ))
                .toList();
    }

    private List<Long> findAllChildren(Long positionId,
                                       Map<Long, List<Position>> childrenMap) {
        List<Long> result = new ArrayList<>();
        Set<Long> visited = new HashSet<>();

        collect(positionId, childrenMap, result, visited);
        return result;
    }

    private void collect(Long parentId,
                         Map<Long, List<Position>> childrenMap,
                         List<Long> result,
                         Set<Long> visited) {

        if (!visited.add(parentId)) return;

        List<Position> children = childrenMap.get(parentId);
        if (children == null) return;

        for (Position child : children) {
            result.add(child.getId());
            collect(child.getId(), childrenMap, result, visited);
        }
    }
}
