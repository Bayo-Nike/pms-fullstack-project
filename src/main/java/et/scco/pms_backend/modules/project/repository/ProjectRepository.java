package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.project.model.Project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByTitleAndSubCityId(String title, Long subCityId);

    // Add Pageable here to support pagination with filtering
    Page<Project> findBySubCity(SubCity subCity, Pageable pageable);

}