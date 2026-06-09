package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.Employee;
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


    @Query("SELECT p FROM Project p WHERE " +
            "(:phase IS NULL OR p.phase = :phase) AND " +
        //     "(p.phase <> ProjectPhase.EXECUTION) AND " +
            "(:subCityId IS NULL OR p.subCity.id = :subCityId) AND " +
            "(:projectType IS NULL OR p.projectType = :projectType) AND " +
            "(:category IS NULL OR p.category = :category) AND " +
            "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')))"
    )
    Page<Project> findInitiations(ProjectType projectType,ProjectPhase phase, Category category, String search, Long subCityId, Pageable pageable);

       Page<Project> findAllByEmployeesContaining(Employee employee, Pageable pageable);

       @Query("SELECT p.currencyType as currency, SUM(p.budget) as amount " +
                     "FROM Project p " +
                     "WHERE (:subId IS NULL OR p.subCity.id = :subId) " +
                     "AND (:type IS NULL OR p.projectType = :type) " + // Logic for BTH/BLD/WAR
                     "GROUP BY p.currencyType")
       List<Map<String, Object>> sumBudgetByCurrencyAndProjectType(@Param("subId") Long subId, @Param("type") ProjectType type);

       // "Smart" Pie Chart Query:
       // If subId is null (Admin), it groups ALL projects by sub-city including Unassigned if null.
       // If subId is provided (User), it only shows the count for that specific sub-city.
       @Query("SELECT COALESCE(sc.subCityName, 'Unassigned') as name, COUNT(p) as value " +
       "FROM Project p LEFT JOIN p.subCity sc " +
       "WHERE (:subId IS NULL OR sc.id = :subId) " +
       "AND p.phase = :phase " +
       "AND (:type IS NULL OR p.projectType = :type) " + // Logic for BTH/BLD/WAR
       "GROUP BY COALESCE(sc.subCityName, 'Unassigned')")
        List<Map<String, Object>> countProjectsBySubCityAndPhaseAndProjectType(@Param("subId") Long subId, @Param("phase") ProjectPhase phase, @Param("type") ProjectType type);

       // Area Chart: SQL Server Format (MMM), filter if subId is provided
       @Query(value = "SELECT FORMAT(created_at, 'MMM') as month, " +
                     "currency_type as currency, " +
                     "SUM(budget) as amount " +
                     "FROM projects " +
                     "WHERE (:subId IS NULL OR sub_city_id = :subId) " +
                     "AND (:type IS NULL OR project_type = :type) " + // Logic for BTH/BLD/WAR
                     "GROUP BY FORMAT(created_at, 'MMM'), MONTH(created_at), currency_type " + // Group by currency too
                     "ORDER BY MONTH(created_at)", nativeQuery = true)
       List<Map<String, Object>> getMonthlyBudgetTrendByProjectType(@Param("subId") Long subId, @Param("type") String type);

       // Count methods with sub-city filter
//        @Query("SELECT p FROM Project p WHERE " +
//             "(p.phase <> ProjectPhase.EXECUTION)");
       long countBySubCityId(Long subCityId);

    @Query("SELECT p FROM Project p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(p.phase <> ProjectPhase.INITIATION) AND " +
            "(:subCityId IS NULL OR p.subCity.id = :subCityId) AND " +
            "(:projectType IS NULL OR p.projectType = :projectType) AND " +
            "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')))" +
            "ORDER BY p.createdAt DESC"
    )
    Page<Project> findWithFilters(
            @Param("projectType") ProjectType projectType,
            @Param("search") String search,
            @Param("status") ProjectStatus status,
            @Param("subCityId") Long subCityId,
            Pageable pageable);

        // For Admin: Count projects by status globally, by subcity is optional
       @Query("SELECT COALESCE(sc.subCityName, 'Unassigned') as subCity, " + 
              "p.status as name, " + 
              "COUNT(p) as value " +
              "FROM Project p " +
              "LEFT JOIN p.subCity sc " +
              "WHERE p.phase = :phase " +
              "AND (:type IS NULL OR p.projectType = :type) " + // Logic for BTH/BLD/WAR
              "GROUP BY sc.subCityName, p.status") 
       List<Map<String, Object>> getProjectStatusDetailed(@Param("phase") ProjectPhase phase, @Param("type") ProjectType type);

        // For Sub-City User: Count projects by status within their sub-city
        @Query("SELECT p.status as name, COUNT(p) as value FROM Project p WHERE p.subCity.id = :subId AND p.phase = :phase GROUP BY p.status")
        List<Map<String, Object>> countProjectsByStatusBySubCityAndPhase(@Param("subId") Long subId, ProjectPhase phase);

        @Query("SELECT COUNT(p) FROM Project p WHERE p.phase = :phase AND (:type IS NULL OR p.projectType = :type)")
        long countByPhaseAndProjectType(@Param("phase") ProjectPhase phase, @Param("type") ProjectType type);

        long countBySubCityIdAndPhaseAndProjectLevel(Long subId, ProjectPhase phase, ProjectLevel projectLevel);

}