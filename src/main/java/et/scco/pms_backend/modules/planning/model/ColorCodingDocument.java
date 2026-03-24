package et.scco.pms_backend.modules.planning.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "color-code-document")
public class ColorCodingDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "color_coding_id")
    private ColorCoding colorCoding;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "color_coding_details_id")
    // private ColorCodingDetails colorCodingDetails;

}
