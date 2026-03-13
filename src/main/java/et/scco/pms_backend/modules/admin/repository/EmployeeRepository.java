package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);

    
   //
   // Count methods with sub-city filter
   long countBySubCityId(Long subCityId);
}
