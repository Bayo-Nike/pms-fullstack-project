package et.scco.pms_backend.modules.project.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.enums.CurrencyType;
import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDate;
//
//@Data
//@Entity
//@Table(name = "projects")
//public class Project {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String projectCode;
//    private String title;           // project name/title
//    private String description;
//
//    @Enumerated(EnumType.STRING)
//    private ProjectType projectType;   // BUILDING, WATER_AND_ROAD
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "city_id")
//    private City city;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "sub_city_id")
//    private SubCity subCity;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "location_id")
//    private Location location;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "contractor_id")
//    private Contractor contractor;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "project_manager_id")
//    private Employee projectManager;
//
//    private LocalDate startDate;
//    private LocalDate endDate;
//
//    @Enumerated(EnumType.STRING)
//    private ProjectStatus status;      // NOT_STARTED, ONGOING, COMPLETED, ON_HOLD, CANCELLED
//
//    @Enumerated(EnumType.STRING)
//    private ProjectPriority priority;  // HIGH, MEDIUM, LOW
//
//    @Enumerated(EnumType.STRING)
//    private CurrencyType currencyType = CurrencyType.ETB;
//
//    private Double budget;
//    private Double budgetUsed;
//
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    public void prePersist() {
//        createdAt = LocalDateTime.now();
//    }
//
//    @ManyToMany
//    @JoinTable(
//            name = "employee_project",
//            joinColumns = @JoinColumn(name = "project_id"),
//            inverseJoinColumns = @JoinColumn(name = "employee_id")
//    )
//    private List<Employee> employees = new ArrayList<>();
//
//    // One project can have multiple tasks
//    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Task> tasks = new ArrayList<>();
//}


@Setter
@Getter
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectCode;
    private String title;
    private String description;
    private String progress;

    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_city_id")
    private SubCity subCity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id")
    private Contractor contractor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    private ProjectPriority priority;

    @Enumerated(EnumType.STRING)
    private CurrencyType currencyType = CurrencyType.ETB;

    private Double budget;
    private Double budgetUsed;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    @ManyToMany
    @JoinTable(
            name = "employee_project",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private List<Employee> employees = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_locations",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "location_id")
    )
    private List<Location> locations = new ArrayList<>();

    // One project can have multiple tasks
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();
}