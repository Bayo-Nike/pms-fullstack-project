package et.scco.pms_backend.modules.demand.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandLevel;
import et.scco.pms_backend.enums.DemandPhase;
import et.scco.pms_backend.enums.DemandStatus;
import et.scco.pms_backend.enums.DemandType;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.Consultancy;
import et.scco.pms_backend.modules.admin.model.Contractor;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.Woreda;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "demands")
public class Demand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String demandCode;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category; // GOV, NON_GOV

    @Enumerated(EnumType.STRING)
    private DemandType demandType; // BUILDING, WATER_ROAD

    @Enumerated(EnumType.STRING)
    private DemandLevel demandLevel; // CITY, SUB_CITY

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
    @JoinColumn(name = "location_id")
    private Location location;

    private String siteLocation;

    @Enumerated(EnumType.STRING)
    private DemandPhase phase = DemandPhase.INITIATION;

    @Enumerated(EnumType.STRING)
    private DemandStatus status = DemandStatus.PENDING;

    private String reviewerRemark;

    @ToString.Exclude // Prevents StackOverflow during System.out.println
    @JsonManagedReference // Tells Jackson this is the parent side
    @OneToMany(mappedBy = "demand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DemandDocument> documents = new ArrayList<>();

    // Helper method to keep relationship in sync
    public void addDocument(DemandDocument document) {
        documents.add(document);
        document.setDemand(this);
    }

    private Long clientId;
    private Long submittedBy; // User ID

    private LocalDateTime requestedDate;
    private LocalDateTime respondedDate;

    @PrePersist
    protected void onCreate() {
        requestedDate = LocalDateTime.now();
        demandCode = "DEM-" + System.currentTimeMillis();
    }
}