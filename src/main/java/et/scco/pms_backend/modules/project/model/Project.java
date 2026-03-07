package et.scco.pms_backend.modules.project.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table (name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
     private LocalDateTime createdAt;

    // Many projects belong to one user
    @ManyToMany(mappedBy = "assignedProjects")
    private List<Employee> employees = new ArrayList<>();

    // One project can have multiple tasks
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;
}
