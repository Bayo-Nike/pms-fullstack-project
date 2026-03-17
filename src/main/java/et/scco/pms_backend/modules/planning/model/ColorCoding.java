package et.scco.pms_backend.modules.planning.model;

import java.time.LocalDateTime;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.enums.Quarter;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "color_codes")
public class ColorCoding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne
    @JoinColumn(name = "sub_city_id")
    private SubCity subCity;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "fiscal_year")
    private String fiscalYear;

    @Enumerated(EnumType.STRING)
    private PlanType planType;

    @Enumerated(EnumType.STRING)
    private BuildingType buildingType;

    @Enumerated(EnumType.STRING)
    private Quarter quarter;

    @Column(name = "target")
    private Long target;

    @Column(name = "achieved")
    private Long achieved;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "performance_document")
    private String performanceDocument; // file name or path

    @ManyToOne
    @JoinColumn(name = "measured_by")
    private User measuredBy;

    @Column(name = "measured_date")
    private LocalDateTime measuredDate;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }
    @PreUpdate
    public void PreUpdate() {
        measuredDate = LocalDateTime.now();
    }
}
