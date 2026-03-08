package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.modules.project.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByTitleAndSubCityId(String title, Long subCityId);

}