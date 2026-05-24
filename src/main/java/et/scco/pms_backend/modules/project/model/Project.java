package et.scco.pms_backend.modules.project.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.enums.*;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDate;


@Data
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectCode;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProjectLevel projectLevel;

    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    @Column(name = "agreement_date")
    private LocalDate agreementDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_city_id")
    private SubCity subCity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "woreda_id")
    private Woreda woreda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id")
    private Contractor contractor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultancy_id")
    private Consultancy  consultancy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    private LocalDate startDate;
    private LocalDate endDate;
    // @Column(name = "extended_days")
    // private int extendedDays;
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectExtension> extensions = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    private ProjectPhase phase;
    

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