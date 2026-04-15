package et.scco.pms_backend.modules.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import et.scco.pms_backend.modules.project.model.ProjectExtension;

public interface ProjectExtensionRepository extends JpaRepository<ProjectExtension, Long>{
 
    Optional<ProjectExtension> findTopByProjectIdOrderByIdDesc(Long projectId);



}
