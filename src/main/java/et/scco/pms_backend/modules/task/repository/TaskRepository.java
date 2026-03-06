package et.scco.pms_backend.modules.task.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.task.model.Task;

public interface TaskRepository extends JpaRepository <Task, Long>{

}
