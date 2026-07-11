package et.scco.pms_backend.modules.task.repository;

import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.task.model.Task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findAllByProjectId(Long projectId);

    List<Task> findAllByEmployees_Id(Long employeeId);

//    @EntityGraph(attributePaths = {"project", "locationIds", "employees"})
//    List<Task> findAllByEmployees_Id(Long employeeId);


//        @Query("SELECT DISTINCT t FROM Task t " +
//                "LEFT JOIN FETCH t.project " +
//                "LEFT JOIN FETCH t.locations " +
//                "JOIN t.employees e " +
//                "WHERE e.id = :employeeId")
//        List<Task> findWithDetailsByEmployees_Id(@Param("employeeId") Long employeeId);

        //
        // Option A: Derived Method Name
    long countByProjectSubCityId(Long subCityId);

    // Option B: Explicit JPQL (Recommended)
//     @Query("SELECT COUNT(t) FROM Task t WHERE t.project.subCity.id = :subCityId")
//     long countTasksBySubCity(@Param("subCityId") Long subCityId);


        @Query("SELECT t FROM Task t " +
                "LEFT JOIN FETCH t.project " +
                "LEFT JOIN FETCH t.locations " +
                "LEFT JOIN FETCH t.employees")
        List<Task> findAllWithDetails();

        @Query("SELECT t FROM Task t " +
                "LEFT JOIN FETCH t.project " +
                "LEFT JOIN FETCH t.locations " +
                "JOIN t.employees e " +
                "WHERE e.id = :employeeId")
        List<Task> findWithDetailsByEmployees_Id(@Param("employeeId") Long employeeId);
 

        // For Admin: Group tasks by Project and Status
        @Query("SELECT t.project.title as projectName, t.status as status, COUNT(t) as count " +
        "FROM Task t WHERE t.project.phase = :phase AND (:type IS NULL OR t.project.projectType = :type)  GROUP BY t.project.title, t.status")
        List<Map<String, Object>> getTaskStatusDetailed(@Param("phase") ProjectPhase phase, @Param("type") ProjectType type);

        // For Sub-City User: Group tasks by Project and Status within their sub-city
        @Query("SELECT t.project.title as projectName, t.status as status, COUNT(t) as count " +
        "FROM Task t WHERE t.project.subCity.id = :subId AND t.project.phase = :phase GROUP BY t.project.title, t.status")
        List<Map<String, Object>> getTaskStatusDetailedBySubCityAndPhase(@Param("subId") Long subId, @Param("phase") ProjectPhase phase);

        
        @Query("SELECT COUNT(t) FROM Task t WHERE t.project.phase = :phase " +
                "AND (:type IS NULL OR t.project.projectType = :type)")
        long countByProjectPhaseAndProjectType(@Param("phase") ProjectPhase phase, @Param("type") ProjectType type);

        long countByProjectSubCityIdAndProjectPhase(Long subId, ProjectPhase execution);

        @Query("SELECT t FROM Task t WHERE " +
                "(:subId IS NULL OR t.project.subCity.id = :subId) AND " +
                "(:type IS NULL OR t.project.projectType = :type) AND " +
                "(:phase IS NULL OR t.project.phase = :phase)")
        Page<Task> findAllTasksByCriteria(@Param("subId") Long subId, 
        @Param("type") ProjectType type, @Param("phase") ProjectPhase phase, Pageable pageable);
}