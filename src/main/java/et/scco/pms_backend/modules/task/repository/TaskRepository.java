package et.scco.pms_backend.modules.task.repository;

import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.task.model.Task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
}