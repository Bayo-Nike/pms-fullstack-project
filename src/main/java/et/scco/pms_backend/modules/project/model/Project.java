package et.scco.pms_backend.modules.project.model;

import java.time.LocalDateTime;
import java.util.List;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;


    // One project can have multiple tasks
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;
}
