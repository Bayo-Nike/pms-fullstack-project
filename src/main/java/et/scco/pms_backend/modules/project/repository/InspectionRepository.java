package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.modules.project.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByProjectId(Long projectId);
}
