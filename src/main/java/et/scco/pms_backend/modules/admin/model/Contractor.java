package et.scco.pms_backend.modules.admin.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ContractorStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table (name = "contractors")
public class Contractor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contractor_name", nullable = false)
    private String contractorName;

    @Enumerated(EnumType.STRING)
    private ContractorStatus status;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "document")
    private String document; // file name or path

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(name = "registered_date")
    private LocalDateTime registeredDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }

}
