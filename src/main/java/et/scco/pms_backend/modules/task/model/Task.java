package et.scco.pms_backend.modules.task.model;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.project.model.Project;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table (name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String status;

    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    // Many tasks belong to one project
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;


     // Many-to-Many: Task assigned to multiple users
     @ManyToMany
     @JoinTable(
             name = "task_employee",
             joinColumns = @JoinColumn(name = "task_id"),
             inverseJoinColumns = @JoinColumn(name = "employee_id")
     )
     private List<Employee> teamMembers = new ArrayList<>();
}
