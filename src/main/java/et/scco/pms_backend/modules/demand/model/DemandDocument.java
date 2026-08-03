package et.scco.pms_backend.modules.demand.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "demand_documents")
public class DemandDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude // Prevents StackOverflow during System.out.println
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demand_id")
    private Demand demand;

    private String fileName;
    private String uniqueFileName;
    private String fileType; // e.g., "Design Approval", "Contract Agreement"
    private String documentName; // User-defined name like 'Design Document'
    private String description;  // User-defined description

}
