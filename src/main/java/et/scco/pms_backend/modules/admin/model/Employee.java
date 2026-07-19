package et.scco.pms_backend.modules.admin.model;

import et.scco.pms_backend.enums.EmployeeStatus;
import et.scco.pms_backend.enums.EmployeeType;
import et.scco.pms_backend.modules.planning.model.ColorCodingDetails;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type", nullable = false, columnDefinition = "nvarchar(255) default 'INTERNAL'")
    private EmployeeType employeeType = EmployeeType.INTERNAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id") // Nullable: only filled if employeeType is EXTERNAL
    private Client client;

    @ManyToMany(mappedBy = "employees")
    private List<Project> assignedProjects = new ArrayList<>();

    @ManyToMany(mappedBy = "employees")
    private List<Task> tasks = new ArrayList<>();

    @OneToOne(mappedBy = "employee")
    private User user;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consultancy> consultancies = new ArrayList<>();
    @OneToMany(mappedBy = "submittedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ColorCodingDetails> colorCodingDetails = new ArrayList<>();

    
}