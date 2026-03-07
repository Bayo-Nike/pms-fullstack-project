package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.model.Employee;

public class EmployeeMapper {

    public static EmployeeResponseDto responseDto(Employee employee){
        return new EmployeeResponseDto(
          employee.getId(),
          employee.getFullName(),
          employee.getDivision().getId(),
          employee.getDivision().getName(),
          employee.getPosition().getId(),
          employee.getPosition().getName(),
          employee.getCity().getName(),
          employee.getSubCity() != null ? employee.getSubCity().getId() : null,
          employee.getSubCity() != null ? employee.getSubCity().getSubCityName() : null,
          employee.getStatus().toString(),
          employee.getEmail()
        );
    }
}
