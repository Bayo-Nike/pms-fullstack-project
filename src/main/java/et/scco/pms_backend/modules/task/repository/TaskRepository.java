package et.scco.pms_backend.modules.task.repository;

import et.scco.pms_backend.modules.task.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findAllByProjectId(Long projectId);
}