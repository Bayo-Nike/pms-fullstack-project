package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.enums.InspectionStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.project.model.Inspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByProjectId(Long projectId);

//     @Query("SELECT i FROM Inspection i WHERE " +
//             "(:projectType IS NULL OR i.project.projectType = :projectType) AND " +
//             "(:subCityId IS NULL OR i.project.subCity.id = :subCityId) AND " +
//             "(:search IS NULL OR LOWER(i.project.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
//             "OR LOWER(i.inspectionType.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
//             "OR LOWER(i.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')))" +
//             "ORDER BY i.inspectionDate DESC"
//     )
//     Page<Inspection> findWithFilters(
//             @Param("projectType") ProjectType projectType,
//             @Param("subCityId") Long subCityId,
//             @Param("search") String search,
//             Pageable pageable);

   @Query("SELECT i FROM Inspection i " +
   "WHERE (:type IS NULL OR i.project.projectType = :type) " +
   "AND (:subCity IS NULL OR i.project.subCity.id = :subCity) " +
   "AND (:search IS NULL OR LOWER(i.inspectionResult) LIKE LOWER(CONCAT('%', :search, '%'))) " +
   "AND i.inspectionStatus IN :statuses")
Page<Inspection> findWithFilters(
    @Param("type") ProjectType type, 
    @Param("subCity") Long subCity, 
    @Param("search") String search, 
    @Param("statuses") List<InspectionStatus> statuses, 
    Pageable pageable);
}
