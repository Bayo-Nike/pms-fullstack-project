package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.dto.response.EmployeeResponseDto;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);

   // Count methods with sub-city filter
   long countBySubCityId(Long subCityId);

    @Query("SELECT e FROM Employee e JOIN FETCH e.division WHERE e.id = :id")
    Optional<Employee> findByIdWithDivision(@Param("id") Long id);

    List<Employee> findAllByPosition_IdIn(List<Long> positionIds);

    Optional<Employee> findByPosition_Id(Long positionId);

    List<Employee> findAllByUser(User user);
}
