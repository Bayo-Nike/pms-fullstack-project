package et.scco.pms_backend.modules.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.project.model.Project;

public interface ProjectRepository extends JpaRepository <Project, Long>{

}
