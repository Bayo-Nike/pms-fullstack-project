package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.model.Employee;

public interface EmployeeService {
    Employee findEmployee(Long id);
}
