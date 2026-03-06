package et.scco.pms_backend.modules.admin.model;

import et.scco.pms_backend.enums.EmployeeStatus;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "division_id", nullable = false)
    private Division division;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_city_id")
    private SubCity subCity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @ManyToMany
    @JoinTable(
            name = "employee_project",
            joinColumns = @JoinColumn(name = "employee_id"),
            inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    private List<Project> assignedProjects;

    @ManyToMany(mappedBy = "teamMembers")
    private List<Task> tasks = new ArrayList<>();
}