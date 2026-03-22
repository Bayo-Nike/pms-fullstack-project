package et.scco.pms_backend.modules.project.model;

import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.enums.WeatherCondition;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inspection_type_id")
    private InspectionType inspectionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_level")
    private InspectionLevel inspectionLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "weather_condition")
    private WeatherCondition weatherCondition;
    @Column(name = "active_workers")
    private Long activeWorkers;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDate inspectionDate;

    @Column(length = 1000)
    private String inspectionResult;
}