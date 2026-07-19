package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.model.Employee;

public class EmployeeMapper {

    public static EmployeeResponseDto responseDto(Employee employee){
    

        return new EmployeeResponseDto(
          employee.getId(),
          employee.getFullName(),
          employee.getDivision().getId(),
          employee.getDivision().getDivisionGroup(),
          employee.getDivision().getName(),
          employee.getPosition().getId(),
          employee.getPosition().getName(),
          employee.getPosition().getParent() != null ? employee.getPosition().getParent().getId() : null,
          employee.getCity().getName(),
          employee.getSubCity() != null ? employee.getSubCity().getId() : null,
          employee.getSubCity() != null ? employee.getSubCity().getSubCityName() : null,
          employee.getStatus().toString(),
          employee.getEmail(),
          employee.getAssignedProjects() != null ? employee.getAssignedProjects().size(): 0,
          employee.getTasks() != null ? employee.getTasks().size(): 0,
           // FIX: Add null checks for Client fields
           employee.getClient() != null ? employee.getClient().getClientName() : null,
           employee.getClient() != null ? employee.getClient().getId() : null,
           // FIX: Add null check for EmployeeType
           employee.getEmployeeType() != null ? employee.getEmployeeType().toString() : null
        );
    }
}
