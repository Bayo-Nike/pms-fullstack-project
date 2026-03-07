package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.modules.admin.dto.request.CreateEmployeeRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/employees")
public class EmployeeController {

    private final EmployeeServiceImpl employeeService;

    @GetMapping
    public List<EmployeeResponseDto> getEmployees(){
        return employeeService.getEmployees();
    }

    @GetMapping("/{id}")
    public EmployeeResponseDto getEmployee(@PathVariable Long id){
        return employeeService.getEmployee(id);
    }

    @PostMapping
    public EmployeeResponseDto createEmployee(@RequestBody CreateEmployeeRequestDto dto){
        return employeeService.createEmployee(dto);
    }
    @PutMapping("/{id}")
    public EmployeeResponseDto update(@PathVariable Long id, @RequestBody CreateEmployeeRequestDto dto){
        return employeeService.updateEmployee(id, dto);
    }
    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id){
        employeeService.deleteEmployee(id);
    }
}
