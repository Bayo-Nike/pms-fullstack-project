package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InspectionTypesRepository extends JpaRepository<InspectionType, Long> {
    boolean existsByNameAndProjectType(String name, ProjectType projectType);
}
