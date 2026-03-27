package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.enums.EmployeeStatus;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.CreateEmployeeRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.mapper.EmployeeMapper;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Position;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.service.EmployeeService;
import et.scco.pms_backend.utility.AuthContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final SubCityServiceImpl subCityService;
    private final DivisionServiceImpl divisionService;
    private final PositionServiceImpl positionService;
    private final AuditLogServiceImpl auditLogService;
    private final AuthContext authContext;

    @Override
    public Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public Employee findEmployeeWithDivision(){
        return employeeRepository.findByIdWithDivision(authContext.getEmployee().getId()).orElse(null);
    }

    @Override
    public EmployeeResponseDto getEmployee(Long id) {
        return EmployeeMapper.responseDto(findEmployee(id));
    }

    @Override
    public EmployeeResponseDto createEmployee(CreateEmployeeRequestDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())){
            throw new RuntimeException("Employee already exists");
        }
        return update(false, 0L, dto);
    }

    @Override
    public EmployeeResponseDto updateEmployee(Long id, CreateEmployeeRequestDto dto) {
        return update(true,id,  dto);
    }

    private EmployeeResponseDto update(boolean type,Long id, CreateEmployeeRequestDto dto){

        Employee employee;
        if (type){
            employee = findEmployee(id);
        }else{
            employee = new Employee();
        }
        Division division = divisionService.getDivision(dto.getDivisionId());

        Position position = positionService
                .findByIdAndDivisionId(dto.getPositionId(), dto.getDivisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid position for division"));

        EmployeeStatus employeeStatus = EmployeeStatus.valueOf(dto.getStatus());

        employee.setFullName(dto.getFullName());
        employee.setEmail(dto.getEmail());
        employee.setDivision(division);
        employee.setPosition(position);
        employee.setCity(subCityService.getCity());

        if(dto.getSubCityId() !=null && dto.getSubCityId() > 0){
            employee.setSubCity(subCityService.getSubCityEntity(dto.getSubCityId()));
        }else{
            employee.setSubCity(null);
        }
        
        employee.setStatus(employeeStatus);
        Employee updated = employeeRepository.save(employee);

        if (type){
            auditLogService.auditLog("Updated", updated.getFullName()+ " Employee has been updated");
        }else{
            auditLogService.auditLog("Created", updated.getFullName() +" Employee has been updated");
        }

        return EmployeeMapper.responseDto(updated);
    }

    @Override
    public List<EmployeeResponseDto> getEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeMapper::responseDto)
                .toList();
    }

    @Override
    public List<Employee> findEmpsByEmployeeIds(List<Long> ids) {
        return employeeRepository.findAllById(ids);
    }

    @Transactional
    @Override
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Employee is not Exist with given id:" + id));
        
    auditLogService.auditLog("Deleted", employee.getFullName()+" has been deleted");
        employeeRepository.deleteById(id);
    }

    @Override
    public List<EmployeeResponseDto> getEmployeesNoUser() {
        return employeeRepository.findAllByUser(null)
                .stream()
                .map(EmployeeMapper::responseDto)
                .collect(Collectors.toList());
    }
}
