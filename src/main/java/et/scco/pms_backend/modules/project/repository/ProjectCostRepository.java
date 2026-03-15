package et.scco.pms_backend.modules.project.repository;

import et.scco.pms_backend.modules.project.model.ProjectCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectCostRepository extends JpaRepository<ProjectCost, Long> {
    List<ProjectCost> findAllByProjectIdOrderByUpdatedAtDesc(Long projectId);
}