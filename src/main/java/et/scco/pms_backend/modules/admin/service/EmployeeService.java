package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.CreateEmployeeRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.model.Employee;

import java.util.List;

public interface EmployeeService {
    Employee findEmployee(Long id);
    EmployeeResponseDto getEmployee(Long id);
    EmployeeResponseDto createEmployee(CreateEmployeeRequestDto dto);
    EmployeeResponseDto updateEmployee(Long id, CreateEmployeeRequestDto dto);
    List<EmployeeResponseDto> getEmployees();

    List<Employee> findEmpsByEmployeeIds(List<Long> ids);

    void deleteEmployee(Long id);
}
