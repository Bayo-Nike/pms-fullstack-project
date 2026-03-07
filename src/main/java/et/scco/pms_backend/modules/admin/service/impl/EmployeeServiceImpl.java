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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final SubCityServiceImpl subCityService;
    private final DivisionServiceImpl divisionService;
    private final PositionServiceImpl positionService;

    @Override
    public Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
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
        Employee employee = new Employee();
        return update(employee, dto);
    }

    @Override
    public EmployeeResponseDto updateEmployee(Long id, CreateEmployeeRequestDto dto) {
        Employee employee = findEmployee(id);
        return update(employee, dto);
    }

    private EmployeeResponseDto update(Employee employee, CreateEmployeeRequestDto dto){

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
        employee.setSubCity(subCityService.getSubCityEntity(dto.getSubCityId()));
        employee.setStatus(employeeStatus);

        return EmployeeMapper.responseDto(employeeRepository.save(employee));
    }

    @Override
    public List<EmployeeResponseDto> getEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeMapper::responseDto)
                .toList();
    }

    @Override
    public void deleteEmployee(Long id) {
        //TODO - check projects and tasks before delete
        //check user
        employeeRepository.deleteById(id);
    }
}
