package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.project.model.Project;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

       boolean existsByTitleAndSubCityId(String title, Long subCityId);

       // Add Pageable here to support pagination with filtering
       Page<Project> findBySubCity(SubCity subCity, Pageable pageable);

       Page<Project> findAllByEmployeesContaining(Employee employee, Pageable pageable);

       @Query("SELECT p.currencyType as currency, SUM(p.budget) as amount " +
                     "FROM Project p " +
                     "WHERE (:subId IS NULL OR p.subCity.id = :subId) " +
                     "GROUP BY p.currencyType")
       List<Map<String, Object>> sumBudgetByCurrency(@Param("subId") Long subId);

       // "Smart" Pie Chart Query:
       // If subId is null (Admin), it groups ALL projects by sub-city.
       // If subId is provided (User), it only shows the count for that specific sub-city.
       @Query("SELECT p.subCity.subCityName as name, COUNT(p) as value " +
                     "FROM Project p " +
                     "WHERE (:subId IS NULL OR p.subCity.id = :subId) " +
                     "GROUP BY p.subCity.subCityName")
       List<Map<String, Object>> countProjectsBySubCity(@Param("subId") Long subId);

       // Area Chart: SQL Server Format (MMM), filter if subId is provided
       @Query(value = "SELECT FORMAT(created_at, 'MMM') as month, " +
                     "currency_type as currency, " + // Add this
                     "SUM(budget) as amount " +
                     "FROM projects " +
                     "WHERE (:subId IS NULL OR sub_city_id = :subId) " +
                     "GROUP BY FORMAT(created_at, 'MMM'), MONTH(created_at), currency_type " + // Group by currency too
                     "ORDER BY MONTH(created_at)", nativeQuery = true)
       List<Map<String, Object>> getMonthlyBudgetTrend(@Param("subId") Long subId);

       // Count methods with sub-city filter
       long countBySubCityId(Long subCityId);


    boolean existsByProjectCode(String projectCode);


       @Query("SELECT p FROM Project p WHERE " +
               "(:status IS NULL OR p.status = :status) AND " +
               "(:subCityId IS NULL OR p.subCity.id = :subCityId) AND " + // Check this matches your field name
               "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
               "OR LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')))")
       Page<Project> findWithFilters(
               @Param("search") String search,
               @Param("status") ProjectStatus status,
               @Param("subCityId") Long subCityId,
               Pageable pageable);
}