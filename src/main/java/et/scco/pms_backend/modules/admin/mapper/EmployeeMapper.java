package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.model.Employee;

public class EmployeeMapper {

    public static EmployeeResponseDto responseDto(Employee employee){
    

        return new EmployeeResponseDto(
            employee.getId(),
            employee.getFullName(),
            // Added null checks for Division
            employee.getDivision() != null ? employee.getDivision().getId() : null,
            employee.getDivision() != null ? employee.getDivision().getDivisionGroup() : null,
            employee.getDivision() != null ? employee.getDivision().getName() : null,
            
            // Added null checks for Position
            employee.getPosition() != null ? employee.getPosition().getId() : null,
            employee.getPosition() != null ? employee.getPosition().getName() : null,
            
            // Added safety check for Position Parent to prevent crash if Position is null
            (employee.getPosition() != null && employee.getPosition().getParent() != null) 
                ? employee.getPosition().getParent().getId() : null,
            
            // Safety check for City
            employee.getCity() != null ? employee.getCity().getName() : null,
            
            employee.getSubCity() != null ? employee.getSubCity().getId() : null,
            employee.getSubCity() != null ? employee.getSubCity().getSubCityName() : null,
            
            // Added null check for Status
            employee.getStatus() != null ? employee.getStatus().toString() : null,
            
            employee.getEmail(),
            employee.getAssignedProjects() != null ? employee.getAssignedProjects().size(): 0,
            employee.getTasks() != null ? employee.getTasks().size(): 0,
            
            // Safe check for Client fields
            employee.getClient() != null ? employee.getClient().getClientName() : null,
            employee.getClient() != null ? employee.getClient().getId() : null,
            
            // Safe check for EmployeeType
            employee.getEmployeeType() != null ? employee.getEmployeeType().toString() : null
          );
    }
}
